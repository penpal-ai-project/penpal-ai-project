import json


def safe_json_loads(value, default=None):
    """
    DB에서 꺼낸 JSON 문자열을 Python 객체로 변환하는 함수.
    값이 없으면 default를 반환한다.
    """
    if default is None:
        default = {}

    if value is None:
        return default

    if isinstance(value, str):
        return json.loads(value)

    return value


def update_average_embedding(old_embedding, new_embedding, old_count):
    """
    기존 누적 임베딩과 새 편지 임베딩을 평균 방식으로 합치는 함수.

    예:
    기존에 n개의 편지가 반영되어 있고,
    새 편지 1개가 들어오면

    updated = (old_embedding * n + new_embedding) / n+1
    """

    if not old_embedding:
        return new_embedding

    if not new_embedding:
        return old_embedding

    updated_embedding = []

    for old_value, new_value in zip(old_embedding, new_embedding):
        updated_value = (
            old_value * old_count + new_value
        ) / (old_count + 1)

        updated_embedding.append(updated_value)

    return updated_embedding


def traits_list_to_dict(traits):
    """
    analyze_traits 결과를 dict로 변환한다.

    입력:
    [
        {"label": "음악을 자주 듣는 사람", "score": 0.95},
        {"label": "감성적인 사람", "score": 0.88}
    ]

    출력:
    {
        "음악을 자주 듣는 사람": 0.95,
        "감성적인 사람": 0.88
    }
    """

    if not traits:
        return {}

    trait_dict = {}

    for item in traits:
        label = item.get("label")
        score = item.get("score", 0)

        if label:
            trait_dict[label] = float(score)

    return trait_dict


def update_profile_traits(old_traits, new_traits, old_count, top_k=20):
    """
    기존 누적 traits와 새 편지 traits를 합친다.

    방식:
    - 같은 라벨이 또 나오면 평균 방식으로 업데이트
    - 새 라벨이면 추가
    - 점수가 높은 상위 top_k개만 유지

    old_traits는 dict 또는 JSON  문자열 형태 가능.
    new_traits는 analyze_traits 결과 list 형태.
    """

    old_trait_dict = safe_json_loads(old_traits, default={})
    new_trait_dict = traits_list_to_dict(new_traits)

    updated_traits = dict(old_trait_dict)

    for label, new_score in new_trait_dict.items():
        old_score = updated_traits.get(label)

        if old_score is None:
            updated_traits[label] = new_score
        else:
            updated_traits[label] = (
                float(old_score) * old_count + float(new_score)
            ) / (old_count + 1)

    # 점수 높은 순서대로 정렬 후 상위 top_k만 유지
    sorted_traits = sorted(
        updated_traits.items(),
        key=lambda item: item[1],
        reverse=True
    )

    top_traits = dict(sorted_traits[:top_k])

    return top_traits


def update_user_profile_analysis(conn, user_id, embedding, traits):
    """
    편지를 저장한 뒤 호출하는 함수.

    역할:
    - user_profiles에 해당 사용자의 누적 embedding / traits가 있으면 업데이트
    - 없으면 새로 생성
    """

    cursor = conn.cursor()

    profile = cursor.execute("""
        SELECT
            user_id,
            profile_embedding,
            profile_traits,
            letter_count
        FROM user_profiles
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    # 아직 누적 프로필이 없는 신규 사용자라면 새로 생성
    if profile is None:
        cursor.execute("""
            INSERT INTO user_profiles (
                user_id,
                profile_embedding,
                profile_traits,
                letter_count
            )
            VALUES (?, ?, ?, ?)
        """, (
            user_id,
            json.dumps(embedding, ensure_ascii=False),
            json.dumps(traits_list_to_dict(traits), ensure_ascii=False),
            1
        ))

        return

    # 기존 프로필이 있다면 누적 업데이트
    old_embedding = safe_json_loads(
        profile["profile_embedding"],
        default=[]
    )

    old_traits = safe_json_loads(
        profile["profile_traits"],
        default={}
    )

    old_count = profile["letter_count"]

    updated_embedding = update_average_embedding(
        old_embedding=old_embedding,
        new_embedding=embedding,
        old_count=old_count
    )

    updated_traits = update_profile_traits(
        old_traits=old_traits,
        new_traits=traits,
        old_count=old_count,
        top_k=20
    )

    cursor.execute("""
        UPDATE user_profiles
        SET
            profile_embedding = ?,
            profile_traits = ?,
            letter_count = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    """, (
        json.dumps(updated_embedding, ensure_ascii=False),
        json.dumps(updated_traits, ensure_ascii=False),
        old_count + 1,
        user_id
    ))