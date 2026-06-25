from flask import Blueprint, request, jsonify
import sqlite3

users_bp = Blueprint("users", __name__)

DB_NAME = "letters.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


@users_bp.route("/users", methods=["POST"])
def create_user():

    data = request.get_json()

    nickname = data.get("nickname")
    gender = data.get("gender")
    preferred_gender = data.get("preferred_gender")
    handwriting_style = data.get("handwriting_style")

    if not nickname or not gender or not preferred_gender:
        return jsonify({
            "error": "nickname, gender, preferred_gender는 필수입니다."
        }), 400

    if len(nickname) < 2 or len(nickname) > 12:
        return jsonify({
            "error": "닉네임은 2자 이상 12자 이하이어야 합니다."
        }), 400

    conn = get_db()

    existing_user = conn.execute("""
        SELECT user_id
        FROM users
        WHERE nickname = ?
    """, (nickname,)).fetchone()

    if existing_user:
        conn.close()

        return jsonify({
            "error": "이미 사용 중인 닉네임입니다."
        }), 409

    cursor = conn.cursor()

    # 사용자 생성
    cursor.execute("""
        INSERT INTO users (
            nickname,
            gender,
            preferred_gender,
            handwriting_style,
            matching_enabled
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        nickname,
        gender,
        preferred_gender,
        handwriting_style,
        1
    ))

    new_user_id = cursor.lastrowid

    # 회원가입 시 나에게 쓰는 첫 편지 자동 생성
    cursor.execute("""
        INSERT INTO letters (
            sender_id,
            receiver_id,
            content
        )
        VALUES (?, ?, ?)
    """, (
        new_user_id,
        new_user_id,
        "처음 나에게 쓰는 편지입니다."
    ))

    conn.commit()

    conn.close()

    return jsonify({
        "message": "회원가입 완료",
        "user_id": new_user_id
    }), 201


@users_bp.route("/users/check-nickname", methods=["GET"])
def check_nickname():

    nickname = request.args.get("nickname")

    if not nickname:
        return jsonify({
            "error": "nickname이 필요합니다."
        }), 400

    conn = get_db()

    user = conn.execute("""
        SELECT user_id
        FROM users
        WHERE nickname = ?
    """, (nickname,)).fetchone()

    conn.close()

    return jsonify({
        "available": user is None
    })


@users_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    conn = get_db()

    user = conn.execute("""
        SELECT
            user_id,
            nickname,
            gender,
            preferred_gender,
            handwriting_style,
            matching_enabled,
            created_at
        FROM users
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    conn.close()

    if user is None:
        return jsonify({
            "error": "사용자를 찾을 수 없습니다."
        }), 404

    return jsonify(dict(user))


@users_bp.route(
    "/users/<int:user_id>/preferred-gender",
    methods=["PATCH"]
)
def update_preferred_gender(user_id):

    data = request.get_json()

    preferred_gender = data.get("preferred_gender")

    conn = get_db()

    conn.execute("""
        UPDATE users
        SET preferred_gender = ?
        WHERE user_id = ?
    """, (
        preferred_gender,
        user_id
    ))

    conn.commit()

    conn.close()

    return jsonify({
        "message": "매칭 선호 성별 수정 완료"
    })