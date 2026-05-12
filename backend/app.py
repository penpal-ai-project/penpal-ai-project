import json
import sqlite3

from users import users_bp
from flask import Flask, request, jsonify
from flask_cors import CORS

from ai_analysis import analyze_text


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

    analysis = analyze_text(content)

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
        json.dumps(analysis["embedding"], ensure_ascii=False),
        analysis["emotion_label"],
        analysis["emotion_score"],
        json.dumps(analysis["traits"], ensure_ascii=False)
    ))

    conn.commit()
    new_letter_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "편지가 저장되었습니다.",
        "letter_id": new_letter_id,
        "emotion_label": analysis["emotion_label"],
        "emotion_score": analysis["emotion_score"],
        "embedding_length": len(analysis["embedding"]),
        "traits": analysis["traits"]
    }), 201


@app.route("/letters/received/<receiver_id>", methods=["GET"])
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
        letter_dict = dict(letter)

        if letter_dict["traits"]:
            letter_dict["traits"] = json.loads(letter_dict["traits"])

        result.append(letter_dict)

    return jsonify(result), 200


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

    letter_dict = dict(letter)

    if letter_dict["traits"]:
        letter_dict["traits"] = json.loads(letter_dict["traits"])

    return jsonify(letter_dict), 200


@app.route("/letters/read/<int:letter_id>", methods=["PATCH"])
def mark_as_read(letter_id):
    conn = get_db()

    conn.execute("""
        UPDATE letters
        SET is_read = 1
        WHERE letter_id = ?
    """, (letter_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "읽음 처리 완료"
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
