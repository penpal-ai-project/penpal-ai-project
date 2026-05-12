import json
import sqlite3

from flask import Flask, request, jsonify
from flask_cors import CORS

from ai_analysis import analyze_text
from matching_score import rank_matching_candidates


app = Flask(__name__)
CORS(app)

DB_NAME = "letters.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS letters (
            letter_id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,

            embedding TEXT,
            emotion_label TEXT,
            emotion_score REAL,
            traits TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def home():
    return "Letter backend server is running."


# 편지 저장
# 이 시점에서만 AI 분석 실행:
# - embedding 생성
# - emotion 분석
# - trait top 12 분석
# - DB 저장
@app.route("/letters", methods=["POST"])
def save_letter():
    data = request.get_json()

    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    content = data.get("content")

    if not sender_id or not receiver_id or not content:
        return jsonify({
            "error": "sender_id, receiver_id, content는 필수입니다."
        }), 400

    # 편지 저장 시점에만 AI 분석 실행
    analysis = analyze_text(content)

    embedding = analysis["embedding"]
    emotion_label = analysis["emotion_label"]
    emotion_score = analysis["emotion_score"]
    traits = analysis["traits"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO letters (
            sender_id,
            receiver_id,
            content,
            embedding,
            emotion_label,
            emotion_score,
            traits
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        sender_id,
        receiver_id,
        content,
        json.dumps(embedding, ensure_ascii=False),
        emotion_label,
        emotion_score,
        json.dumps(traits, ensure_ascii=False)
    ))

    conn.commit()
    new_letter_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "편지가 저장되었습니다.",
        "letter_id": new_letter_id,

        # emotion은 매칭용이 아니라 감정 기록용으로만 저장
        "emotion_label": emotion_label,
        "emotion_score": emotion_score,

        # traits는 매칭에 사용
        "traits": traits,

        # 테스트 확인용
        "embedding_length": len(embedding)
    }), 201


# 받은 편지함 조회
@app.route("/letters/received/<int:receiver_id>", methods=["GET"])
def get_received_letters(receiver_id):
    conn = get_db()

    letters = conn.execute("""
        SELECT
            letter_id,
            sender_id,
            receiver_id,
            content,
            emotion_label,
            emotion_score,
            traits,
            created_at,
            is_read
        FROM letters
        WHERE receiver_id = ?
        ORDER BY created_at DESC
    """, (receiver_id,)).fetchall()

    conn.close()

    result = []

    for letter in letters:
        item = dict(letter)

        # traits는 DB에 JSON 문자열로 저장되어 있으므로 다시 list로 변환
        if item.get("traits"):
            item["traits"] = json.loads(item["traits"])

        result.append(item)

    return jsonify(result), 200


# 특정 편지 하나 조회
@app.route("/letters/<int:letter_id>", methods=["GET"])
def get_letter_detail(letter_id):
    conn = get_db()

    letter = conn.execute("""
        SELECT
            letter_id,
            sender_id,
            receiver_id,
            content,
            emotion_label,
            emotion_score,
            traits,
            created_at,
            is_read
        FROM letters
        WHERE letter_id = ?
    """, (letter_id,)).fetchone()

    conn.close()

    if letter is None:
        return jsonify({
            "error": "해당 편지를 찾을 수 없습니다."
        }), 404

    result = dict(letter)

    if result.get("traits"):
        result["traits"] = json.loads(result["traits"])

    return jsonify(result), 200


# 편지 읽음 처리
@app.route("/letters/read/<int:letter_id>", methods=["PATCH"])
def mark_as_read(letter_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE letters
        SET is_read = 1
        WHERE letter_id = ?
    """, (letter_id,))

    conn.commit()
    updated_count = cursor.rowcount
    conn.close()

    if updated_count == 0:
        return jsonify({
            "error": "해당 편지를 찾을 수 없습니다."
        }), 404

    return jsonify({
        "message": "읽음 처리 완료",
        "letter_id": letter_id
    }), 200


# 매칭 결과 조회
# 여기서는 AI 분석을 다시 실행하지 않음.
# DB에 저장된 embedding, traits만 불러와서 유사도 계산.
@app.route("/match/<int:user_id>", methods=["GET"])
def match_users(user_id):
    conn = get_db()

    # 현재 사용자가 보낸 최신 편지 1개를 기준으로 매칭
    target_letter = conn.execute("""
        SELECT
            sender_id AS user_id,
            embedding,
            traits
        FROM letters
        WHERE sender_id = ?
          AND embedding IS NOT NULL
          AND traits IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id,)).fetchone()

    if target_letter is None:
        conn.close()
        return jsonify({
            "error": "해당 사용자의 분석된 편지가 없습니다."
        }), 404

    # 다른 사용자들의 최신 편지만 후보로 사용
    candidate_rows = conn.execute("""
        SELECT
            l.sender_id AS user_id,
            l.embedding,
            l.traits
        FROM letters l
        INNER JOIN (
            SELECT
                sender_id,
                MAX(created_at) AS latest_created_at
            FROM letters
            WHERE sender_id != ?
              AND embedding IS NOT NULL
              AND traits IS NOT NULL
            GROUP BY sender_id
        ) latest
        ON l.sender_id = latest.sender_id
        AND l.created_at = latest.latest_created_at
    """, (user_id,)).fetchall()

    conn.close()

    candidate_profiles = []

    for candidate in candidate_rows:
        candidate_profiles.append({
            "user_id": candidate["user_id"],
            "embedding": candidate["embedding"],
            "traits": candidate["traits"]
        })

    results = rank_matching_candidates(
        target_user_id=user_id,
        target_embedding=target_letter["embedding"],
        target_traits=target_letter["traits"],
        candidate_profiles=candidate_profiles,
        top_k=3
    )

    return jsonify({
        "target_user_id": user_id,
        "matches": results
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True)