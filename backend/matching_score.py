import json
import math


# MVP 기준 추천 가중치
# embedding: 글 전체 의미 유사도
# traits: 성향/관심사 라벨 유사도
EMBEDDING_WEIGHT = 0.75
TRAIT_WEIGHT = 0.25


def safe_json_loads(value):
    """
    DB에서 가져온 값이 JSON 문자열이면 list/dict로 변환하고,
    이미 list/dict면 그대로 반환하는 함수
    """
    if value is None:
        return None

    if isinstance(value, str):
        return json.loads(value)

    return value


def cosine_similarity(vector_a, vector_b):
    """
    두 임베딩 벡터의 cosine similarity를 계산하는 함수.
    반환값은 0~1 범위로 정규화한다.
    """

    if not vector_a or not vector_b:
        return 0.0

    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))

    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    raw_score = dot_product / (norm_a * norm_b)

    # cosine similarity는 원래 -1~1 범위라서 0~1로 변환
    normalized_score = (raw_score + 1) / 2

    return normalized_score


def traits_to_dict(traits):
    """
    trait_analysis 결과 또는 user_profiles의 누적 traits를
    비교하기 쉬운 dict 형태로 변환.

    입력 형태 1:
    [
        {"label": "음악 좋아하는 사람", "score": 0.99},
        {"label": "혼자 산책 좋아하는 사람", "score": 0.95}
    ]

    입력 형태 2:
    {
        "음악 좋아하는 사람": 0.99,
        "혼자 산책 좋아하는 사람": 0.95
    }

    출력:
    {
        "음악 좋아하는 사람": 0.99,
        "혼자 산책 좋아하는 사람": 0.95
    }
    """

    traits = safe_json_loads(traits)

    if not traits:
        return {}

    # user_profiles에서 가져온 누적 traits는 이미 dict 형태
    if isinstance(traits, dict):
        return {
            label: float(score)
            for label, score in traits.items()
        }

    # letters에서 가져온 traits는 list 형태
    trait_dict = {}

    for item in traits:
        label = item.get("label")
        score = item.get("score", 0)

        if label:
            trait_dict[label] = float(score)

    return trait_dict


def trait_similarity(traits_a, traits_b):
    """
    두 사용자의 trait 라벨 유사도를 계산한다.

    방식:
    - 같은 라벨이 있으면 공통점으로 판단
    - 공통 라벨 점수는 min(score_a, score_b)
    - 전체 라벨 점수는 max(score_a, score_b)
    - weighted jaccard 방식으로 0~1 점수 계산
    """

    dict_a = traits_to_dict(traits_a)
    dict_b = traits_to_dict(traits_b)

    if not dict_a or not dict_b:
        return 0.0, []

    all_labels = set(dict_a.keys()) | set(dict_b.keys())
    common_labels = set(dict_a.keys()) & set(dict_b.keys())

    if not all_labels:
        return 0.0, []

    intersection_score = 0.0
    union_score = 0.0

    for label in all_labels:
        score_a = dict_a.get(label, 0.0)
        score_b = dict_b.get(label, 0.0)

        intersection_score += min(score_a, score_b)
        union_score += max(score_a, score_b)

    if union_score == 0:
        return 0.0, []

    score = intersection_score / union_score

    matched_traits = sorted(
        list(common_labels),
        key=lambda label: min(dict_a[label], dict_b[label]),
        reverse=True
    )

    return score, matched_traits


def calculate_matching_score(
    target_embedding,
    target_traits,
    candidate_embedding,
    candidate_traits,
    embedding_weight=EMBEDDING_WEIGHT,
    trait_weight=TRAIT_WEIGHT
):
    """
    한 명의 후보 사용자와 현재 사용자의 최종 매칭 점수를 계산한다.
    emotion은 MVP에서 제외하고 embedding + traits만 사용한다.
    """

    target_embedding = safe_json_loads(target_embedding)
    candidate_embedding = safe_json_loads(candidate_embedding)

    embedding_score = cosine_similarity(
        target_embedding,
        candidate_embedding
    )

    trait_score, matched_traits = trait_similarity(
        target_traits,
        candidate_traits
    )

    final_score = (
        embedding_score * embedding_weight
        + trait_score * trait_weight
    )

    return {
        "final_score": round(final_score, 4),
        "embedding_score": round(embedding_score, 4),
        "trait_score": round(trait_score, 4),
        "matched_traits": matched_traits
    }


def rank_matching_candidates(
    target_user_id,
    target_embedding,
    target_traits,
    candidate_profiles,
    top_k=3
):
    """
    여러 후보 사용자와 비교해서 최종 점수 높은 순으로 정렬한다.

    candidate_profiles 입력 예시:
    [
        {
            "user_id": 2,
            "embedding": [...],
            "traits": [...]
        },
        {
            "user_id": 3,
            "embedding": [...],
            "traits": [...]
        }
    ]

    반환:
    final_score 높은 순서대로 최대 top_k명
    """

    results = []

    for candidate in candidate_profiles:
        candidate_user_id = candidate.get("user_id")

        # 자기 자신은 매칭 후보에서 제외
        if candidate_user_id == target_user_id:
            continue

        candidate_embedding = candidate.get("embedding")
        candidate_traits = candidate.get("traits")

        score_result = calculate_matching_score(
            target_embedding=target_embedding,
            target_traits=target_traits,
            candidate_embedding=candidate_embedding,
            candidate_traits=candidate_traits
        )

        results.append({
            "user_id": candidate_user_id,
            "final_score": score_result["final_score"],
            "embedding_score": score_result["embedding_score"],
            "trait_score": score_result["trait_score"],
            "matched_traits": score_result["matched_traits"]
        })

    # 최종 점수 높은 순으로 정렬
    results.sort(
        key=lambda item: item["final_score"],
        reverse=True
    )

    # rank 추가
    ranked_results = []

    for index, item in enumerate(results[:top_k], start=1):
        item["rank"] = index
        ranked_results.append(item)

    return ranked_results