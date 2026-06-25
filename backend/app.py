import json
import sqlite3

from flask import Flask, request, jsonify
from flask_cors import CORS

from users import users_bp

from ai_analysis import analyze_text
from matching_score import rank_matching_candidates
from profile_updater import update_user_profile_analysis
from datetime import datetime

app = Flask(__name__)

CORS(app, origins=[
    "http://10.21.43.13:8080",
    "http://192.168.126.1:8080",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
])

app.register_blueprint(users_bp)

DB_NAME = "letters.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    # 1. 편지 저장용 테이블
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

    # 2. 사용자 정보 저장용 테이블
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL UNIQUE,
            gender TEXT NOT NULL,
            preferred_gender TEXT NOT NULL,
            handwriting_style TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 3. 사용자 누적 프로필 저장용 테이블
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id INTEGER PRIMARY KEY,
            profile_embedding TEXT,
            profile_traits TEXT,
            letter_count INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
        # 4. 매칭 관계 저장용 테이블 -> 중복 방지에도 이용
    conn.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            match_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_a_id INTEGER NOT NULL,
            user_b_id INTEGER NOT NULL,
            final_score REAL,
            embedding_score REAL,
            trait_score REAL,
            matched_traits TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    try:
        conn.execute("""
            ALTER TABLE users
            ADD COLUMN matching_enabled INTEGER DEFAULT 1
        """)
    except sqlite3.OperationalError:
        pass

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
    data = request.get_json() or {}

    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    content = data.get("content")

    if sender_id is None or receiver_id is None or content is None or not str(content).strip():
        return jsonify({
            "error": "sender_id, receiver_id, content는 필수입니다."
        }), 400

    try:
        sender_id = int(sender_id)
        receiver_id = int(receiver_id)
    except (TypeError, ValueError):
        return jsonify({
            "error": "sender_id와 receiver_id는 숫자여야 합니다."
        }), 400

    # 편지 저장 시점에만 AI 분석 실행
    analysis = analyze_text(content)
    print(analysis)

    embedding = analysis["embedding"]
    emotion_label = analysis["emotion_label"]
    emotion_score = analysis["emotion_score"]
    traits = analysis["traits"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE letters
        SET status = 'received'
        WHERE sender_id = ?
          AND receiver_id = ?
          AND status = 'pending'
    """, (
        receiver_id,
        sender_id
    ))

    cursor.execute("""
        INSERT INTO letters (
            sender_id,
            receiver_id,
            content,
            embedding,
            emotion_label,
            emotion_score,
            traits,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sender_id,
        receiver_id,
        content,
        json.dumps(embedding, ensure_ascii=False),
        emotion_label,
        emotion_score,
        json.dumps(traits, ensure_ascii=False),
        "pending"
    ))

    new_letter_id = cursor.lastrowid

    # 편지 분석 결과를 사용자 누적 프로필에 반영

    update_user_profile_analysis(
        conn=conn,
        user_id=sender_id,
        embedding=embedding,
        traits=traits
    )
    

    conn.commit()
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

# 특정 사용자와 주고받은 편지 조회
@app.route("/letters/chat/<int:my_id>/<int:target_id>", methods=["GET"])
def get_chat_letters(my_id, target_id):

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

        WHERE
            (sender_id = ? AND receiver_id = ?)

            OR

            (sender_id = ? AND receiver_id = ?)

        ORDER BY created_at ASC
    """, (
        my_id,
        target_id,
        target_id,
        my_id
    )).fetchall()

    conn.close()

    result = []

    for letter in letters:

        item = dict(letter)

        if item.get("traits"):
            item["traits"] = json.loads(item["traits"])

        result.append(item)

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

# 내가 편지를 주고받은 사용자 목록 조회
@app.route("/conversations/<int:user_id>", methods=["GET"])
def get_conversations(user_id):
    conn = get_db()

    users = conn.execute("""
        SELECT DISTINCT
            u.user_id,
            u.nickname,
            u.gender,
            u.handwriting_style
        FROM users u
        WHERE u.user_id != ?
          AND (
              EXISTS (
                  SELECT 1
                  FROM letters l
                  WHERE
                      (l.sender_id = ? AND l.receiver_id = u.user_id)
                      OR
                      (l.receiver_id = ? AND l.sender_id = u.user_id)
              )
              OR
              EXISTS (
                  SELECT 1
                  FROM matches m
                  WHERE m.status = 'active'
                    AND (
                        (m.user_a_id = ? AND m.user_b_id = u.user_id)
                        OR
                        (m.user_b_id = ? AND m.user_a_id = u.user_id)
                    )
              )
          )
        ORDER BY u.nickname ASC
    """, (user_id, user_id, user_id, user_id, user_id)).fetchall()

    conn.close()

    result = []
    for user in users:
        result.append(dict(user))

    return jsonify(result), 200

# 매칭 결과 조회
# 여기서는 AI 분석을 다시 실행하지 않음.
# user_profiles에 누적 저장된 embedding, traits만 불러와서 유사도 계산.
# 이미 active 상태로 매칭된 사용자는 다시 추천하지 않음.
@app.route("/match/<int:user_id>", methods=["GET"])
def match_users(user_id):
    conn = get_db()

    total_user_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM users
    """).fetchone()["count"]

    total_profile_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM user_profiles
    """).fetchone()["count"]

    # 현재 사용자의 누적 프로필을 기준으로 매칭
    target_profile = conn.execute("""
        SELECT
            up.user_id,
            up.profile_embedding,
            up.profile_traits,
            up.letter_count,
            u.preferred_gender
        FROM user_profiles up
        JOIN users u
          ON up.user_id = u.user_id
        WHERE up.user_id = ?
          AND up.profile_embedding IS NOT NULL
          AND up.profile_traits IS NOT NULL
    """, (user_id,)).fetchone()

    if target_profile is None:
        target_user = conn.execute("""
            SELECT preferred_gender
            FROM users
            WHERE user_id = ?
        """, (user_id,)).fetchone()

        debug_message = "현재 사용자의 누적 프로필이 없습니다. 먼저 편지를 작성해야 매칭할 수 있습니다."
        response = {
            "target_user_id": user_id,
            "target_profile_exists": False,
            "target_letter_count": 0,
            "matching_base": "user_profiles",
            "preferred_gender": target_user["preferred_gender"] if target_user else None,
            "excluded_user_ids": [],
            "total_user_count": total_user_count,
            "total_profile_count": total_profile_count,
            "candidate_count_before_filter": 0,
            "candidate_count_after_gender_filter": 0,
            "debug_message": debug_message,
            "matches": []
        }

        print("===== MATCH DEBUG =====")
        print("target_user_id:", user_id)
        print("total_user_count:", total_user_count)
        print("total_profile_count:", total_profile_count)
        print("candidate_count_before_filter:", 0)
        print("candidate_count_after_gender_filter:", 0)
        print("excluded_user_ids:", [])
        print("=======================")

        conn.close()
        return jsonify(response), 200
    
    target_user_matching_enabled = conn.execute("""
        SELECT matching_enabled
        FROM users
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    if target_user_matching_enabled is not None and target_user_matching_enabled["matching_enabled"] == 0:
        response = {
            "target_user_id": user_id,
            "target_profile_exists": True,
            "target_letter_count": target_profile["letter_count"],
            "matching_base": "user_profiles",
            "preferred_gender": target_profile["preferred_gender"],
            "excluded_user_ids": [],
            "total_user_count": total_user_count,
            "total_profile_count": total_profile_count,
            "candidate_count_before_filter": 0,
            "candidate_count_after_gender_filter": 0,
            "debug_message": "현재 사용자가 매칭을 원하지 않는 상태입니다.",
            "matches": []
        }

        conn.close()
        return jsonify(response), 200
    
    # 이미 active 상태로 매칭된 사용자 목록 조회
    matched_rows = conn.execute("""
        SELECT
            CASE
                WHEN user_a_id = ? THEN user_b_id
                ELSE user_a_id
            END AS matched_user_id
        FROM matches
        WHERE status = 'active'
          AND (user_a_id = ? OR user_b_id = ?)
    """, (user_id, user_id, user_id)).fetchall()

    already_matched_user_ids = [
        row["matched_user_id"]
        for row in matched_rows
    ]

    if len(already_matched_user_ids) >= 3:
        debug_message = "이미 active 매칭된 사용자가 3명이라 새 매칭을 받을 수 없습니다."

        response = {
            "target_user_id": user_id,
            "target_profile_exists": True,
            "target_letter_count": target_profile["letter_count"],
            "matching_base": "user_profiles",
            "preferred_gender": target_profile["preferred_gender"],
            "excluded_user_ids": already_matched_user_ids,
            "total_user_count": total_user_count,
            "total_profile_count": total_profile_count,
            "candidate_count_before_filter": 0,
            "candidate_count_after_gender_filter": 0,
            "debug_message": debug_message,
            "matches": []
        }

        print("===== MATCH DEBUG =====")
        print("target_user_id:", user_id)
        print("total_user_count:", total_user_count)
        print("total_profile_count:", total_profile_count)
        print("candidate_count_before_filter:", 0)
        print("candidate_count_after_gender_filter:", 0)
        print("excluded_user_ids:", already_matched_user_ids)
        print("=======================")

        conn.close()
        return jsonify(response), 200


    # 다른 사용자들의 누적 프로필을 후보로 사용
    # 단, 이미 매칭된 사용자는 제외
    candidate_rows = conn.execute("""
        SELECT
            up.user_id,
            u.nickname,
            up.profile_embedding,
            up.profile_traits,
            up.letter_count,
            u.gender
        FROM user_profiles up
        JOIN users u ON up.user_id = u.user_id
        WHERE up.user_id != ?
          AND up.profile_embedding IS NOT NULL
          AND up.profile_traits IS NOT NULL
    """, (user_id,)).fetchall()

    candidates_before_gender_filter = []

    for candidate in candidate_rows:
        candidate_user_id = candidate["user_id"]

        candidate_matching_enabled = conn.execute("""
            SELECT matching_enabled
            FROM users
            WHERE user_id = ?
        """, (candidate_user_id,)).fetchone()

        if candidate_matching_enabled and candidate_matching_enabled["matching_enabled"] == 0:
            continue

        if candidate_user_id in already_matched_user_ids:
            continue

        candidate_match_count = conn.execute("""
            SELECT COUNT(*) AS count
            FROM matches
            WHERE status = 'active'
              AND (user_a_id = ? OR user_b_id = ?)
        """, (candidate_user_id, candidate_user_id)).fetchone()["count"]

        if candidate_match_count >= 3:
            continue

        candidates_before_gender_filter.append(candidate)

    candidate_count_before_filter = len(candidates_before_gender_filter)
    preferred_gender = target_profile["preferred_gender"]
    skip_gender_filter = preferred_gender in ("전체", "any")
    candidates_after_gender_filter = []

    for candidate in candidates_before_gender_filter:
        if skip_gender_filter or candidate["gender"] == preferred_gender:
            candidates_after_gender_filter.append(candidate)

    candidate_count_after_gender_filter = len(candidates_after_gender_filter)

    candidate_profiles = []

    for candidate in candidates_after_gender_filter:
        candidate_profiles.append({
            "user_id": candidate["user_id"],
            "nickname": candidate["nickname"],
            "embedding": candidate["profile_embedding"],
            "traits": candidate["profile_traits"]
        })

    print("===== MATCH DEBUG =====")
    print("target_user_id:", user_id)
    print("total_user_count:", total_user_count)
    print("total_profile_count:", total_profile_count)
    print("candidate_count_before_filter:", candidate_count_before_filter)
    print("candidate_count_after_gender_filter:", candidate_count_after_gender_filter)
    print("excluded_user_ids:", already_matched_user_ids)
    print("=======================")

    if candidate_count_before_filter == 0:
        results = []
        debug_message = "매칭 가능한 다른 사용자 프로필이 없습니다. 다른 유저도 편지를 작성해야 매칭 후보가 생깁니다."

    elif candidate_count_after_gender_filter == 0:
        results = []
        debug_message = "선호 성별 조건에 맞는 후보가 없습니다. 테스트를 위해 preferred_gender를 전체 또는 any로 설정해보세요."

    else:
        results = rank_matching_candidates(
            target_user_id=user_id,
            target_embedding=target_profile["profile_embedding"],
            target_traits=target_profile["profile_traits"],
            candidate_profiles=candidate_profiles,
            top_k=3
        )
        results = results[:1]

        nickname_by_user_id = {
            candidate["user_id"]: candidate["nickname"]
            for candidate in candidate_profiles
        }

        for result in results:
            result["nickname"] = nickname_by_user_id.get(result["user_id"])

        if len(results) == 0:
            debug_message = "후보 프로필은 있지만 매칭 점수 계산 결과가 없습니다. embedding 또는 traits 저장 형식을 확인해주세요."
        else:
            debug_message = None
            
    # 1명은 무조건 추천하고,
    # 2~3번째 후보는 점수가 충분히 높을 때만 추가 추천
    EXTRA_MATCH_THRESHOLD = 0.75

    filtered_results = []

    for index, result in enumerate(results):
        if index == 0:
            filtered_results.append(result)
        elif result["final_score"] >= EXTRA_MATCH_THRESHOLD:
            filtered_results.append(result)

    results = filtered_results

    if candidate_count_after_gender_filter > 0 and len(results) == 0 and debug_message is None:
        debug_message = "후보 프로필은 있지만 매칭 점수 계산 결과가 없습니다. embedding 또는 traits 저장 형식을 확인해주세요."

    # 추천된 매칭 결과를 matches 테이블에 저장
    for result in results:
        my_match_count = conn.execute("""
            SELECT COUNT(*) AS count
            FROM matches
            WHERE status = 'active'
              AND (user_a_id = ? OR user_b_id = ?)
        """, (user_id, user_id)).fetchone()["count"]

        other_match_count = conn.execute("""
            SELECT COUNT(*) AS count
            FROM matches
            WHERE status = 'active'
              AND (user_a_id = ? OR user_b_id = ?)
        """, (result["user_id"], result["user_id"])).fetchone()["count"]

        if my_match_count >= 3 or other_match_count >= 3:
            continue

        user_a_id = min(user_id, result["user_id"])
        user_b_id = max(user_id, result["user_id"])

        # 혹시 중복 저장되는 상황 방지
        existing_match = conn.execute("""
            SELECT match_id
            FROM matches
            WHERE status = 'active'
              AND user_a_id = ?
              AND user_b_id = ?
        """, (user_a_id, user_b_id)).fetchone()

        if existing_match:
            continue

        conn.execute("""
            INSERT INTO matches (
                user_a_id,
                user_b_id,
                final_score,
                embedding_score,
                trait_score,
                matched_traits,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        """, (
            user_a_id,
            user_b_id,
            result["final_score"],
            result["embedding_score"],
            result["trait_score"],
            json.dumps(result["matched_traits"], ensure_ascii=False)
        ))

    conn.commit()
    conn.close()

    return jsonify({
        "target_user_id": user_id,
        "target_profile_exists": True,
        "target_letter_count": target_profile["letter_count"],
        "matching_base": "user_profiles",
        "preferred_gender": preferred_gender,
        "excluded_user_ids": already_matched_user_ids,
        "total_user_count": total_user_count,
        "total_profile_count": total_profile_count,
        "candidate_count_before_filter": candidate_count_before_filter,
        "candidate_count_after_gender_filter": candidate_count_after_gender_filter,
        "debug_message": debug_message,
        "matches": results[:1]
    }), 200
# active 매칭 수 조회
def get_active_match_count(user_id):
    conn = get_db()

    count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM matches
        WHERE status = 'active'
          AND (user_a_id = ? OR user_b_id = ?)
    """, (user_id, user_id)).fetchone()["count"]

    conn.close()
    return count


# 특정 두 사용자가 이미 active 매칭인지 확인
def has_active_match(user1_id, user2_id):
    user_a_id = min(user1_id, user2_id)
    user_b_id = max(user1_id, user2_id)

    conn = get_db()

    existing_match = conn.execute("""
        SELECT match_id
        FROM matches
        WHERE status = 'active'
          AND user_a_id = ?
          AND user_b_id = ?
    """, (user_a_id, user_b_id)).fetchone()

    conn.close()
    return existing_match is not None


# 매칭 ON/OFF 변경
@app.route("/users/<int:user_id>/matching-enabled", methods=["PATCH"])
def update_matching_enabled(user_id):
    data = request.get_json() or {}
    matching_enabled = data.get("matching_enabled")

    if matching_enabled is None:
        return jsonify({
            "error": "matching_enabled 값이 필요합니다."
        }), 400

    matching_enabled = 1 if matching_enabled else 0

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users
        SET matching_enabled = ?
        WHERE user_id = ?
    """, (matching_enabled, user_id))

    conn.commit()
    updated_count = cursor.rowcount
    conn.close()

    if updated_count == 0:
        return jsonify({
            "error": "해당 사용자를 찾을 수 없습니다."
        }), 404

    return jsonify({
        "message": "매칭 설정이 변경되었습니다.",
        "user_id": user_id,
        "matching_enabled": bool(matching_enabled)
    }), 200


# 내가 현재 매칭을 원하는 상태인지 조회
@app.route("/users/<int:user_id>/matching-enabled", methods=["GET"])
def get_matching_enabled(user_id):
    conn = get_db()

    user = conn.execute("""
        SELECT user_id, nickname, matching_enabled
        FROM users
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    conn.close()

    if user is None:
        return jsonify({
            "error": "해당 사용자를 찾을 수 없습니다."
        }), 404

    return jsonify({
        "user_id": user["user_id"],
        "nickname": user["nickname"],
        "matching_enabled": bool(user["matching_enabled"])
    }), 200

#백엔드 서버 외부 접속
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
