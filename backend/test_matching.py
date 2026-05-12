from ai_analysis import analyze_text
from matching_score import rank_matching_candidates


# 기준 사용자 편지
target_user_id = 1

target_letter = """
요즘은 혼자 음악 들으면서 산책하는 시간이 제일 좋아요.
사람을 많이 만나는 것보다 조용히 생각을 정리하는 시간이 더 편하고,
편지를 주고받는다면 가벼운 말보다는 서로의 하루나 감정을 천천히 나누고 싶어요.
"""


# 후보 사용자 10명의 편지
sample_letters = [
    {
        "user_id": 2,
        "content": """
        저도 혼자 있는 시간이 꽤 소중한 편이에요.
        밤에 음악을 들으면서 이런저런 생각을 정리하는 걸 좋아하고,
        누군가와 깊은 이야기를 천천히 나누는 관계가 편해요.
        """
    },
    {
        "user_id": 3,
        "content": """
        저는 사람 만나는 걸 좋아하고 새로운 친구를 사귀는 게 즐거워요.
        주말에는 밖에 나가서 활동하는 걸 좋아하고,
        대화도 밝고 재미있게 이어가는 편이에요.
        """
    },
    {
        "user_id": 4,
        "content": """
        요즘 조금 지쳐서 그런지 누군가에게 제 이야기를 털어놓고 싶어요.
        조언보다는 그냥 제 마음을 들어주고 공감해주는 사람이 있으면 좋겠어요.
        """
    },
    {
        "user_id": 5,
        "content": """
        저는 영화랑 드라마 보는 걸 좋아해요.
        본 작품에 대해 이야기 나누는 것도 좋아하고,
        가끔은 감성적인 장면이나 대사에 오래 빠져 있는 편이에요.
        """
    },
    {
        "user_id": 6,
        "content": """
        저는 계획적으로 하루를 보내는 걸 좋아해요.
        목표를 세우고 하나씩 해내는 과정에서 만족감을 느끼고,
        현실적인 조언을 주고받는 대화를 선호해요.
        """
    },
    {
        "user_id": 7,
        "content": """
        저는 편지를 통해 서로의 일상을 천천히 알아가는 게 좋아요.
        빠르게 친해지기보다는 부담 없이 오래 이어지는 관계를 선호하고,
        진심이 담긴 글을 읽는 걸 좋아해요.
        """
    },
    {
        "user_id": 8,
        "content": """
        게임을 좋아하고 짧고 편한 대화를 선호해요.
        너무 무거운 이야기보다는 장난도 치고 웃으면서 편하게 대화하는 게 좋아요.
        """
    },
    {
        "user_id": 9,
        "content": """
        카페에 가서 책을 읽거나 글을 쓰는 걸 좋아해요.
        조용한 분위기에서 생각을 정리하는 시간이 좋고,
        비슷한 감성을 가진 사람과 대화해보고 싶어요.
        """
    },
    {
        "user_id": 10,
        "content": """
        저는 운동하는 걸 좋아하고 밖에서 활동하는 시간이 많아요.
        새로운 장소에 가보는 것도 좋아하고,
        즉흥적으로 약속을 잡는 것도 꽤 즐기는 편이에요.
        """
    },
    {
        "user_id": 11,
        "content": """
        요즘은 마음이 복잡해서 혼자 산책을 자주 해요.
        음악을 들으면서 생각을 정리하고,
        누군가와 감정을 솔직하게 나누는 편지를 써보고 싶어요.
        """
    }
]


print("기준 사용자 편지 분석 중...")
target_analysis = analyze_text(target_letter)

print("\n기준 사용자 분석 결과")
print("=" * 60)
print("emotion_label:", target_analysis["emotion_label"])
print("emotion_score:", target_analysis["emotion_score"])
print("traits:")
for trait in target_analysis["traits"]:
    print("-", trait["label"], trait["score"])


candidate_profiles = []

print("\n후보 사용자 편지 분석 중...")
print("=" * 60)

for sample in sample_letters:
    user_id = sample["user_id"]
    content = sample["content"]

    print(f"user_id {user_id} 분석 중...")

    analysis = analyze_text(content)

    candidate_profiles.append({
        "user_id": user_id,
        "embedding": analysis["embedding"],
        "traits": analysis["traits"],
        "emotion_label": analysis["emotion_label"],
        "emotion_score": analysis["emotion_score"],
        "content": content.strip()
    })


results = rank_matching_candidates(
    target_user_id=target_user_id,
    target_embedding=target_analysis["embedding"],
    target_traits=target_analysis["traits"],
    candidate_profiles=candidate_profiles,
    top_k=10
)


print("\n\n최종 매칭 결과")
print("=" * 60)

for result in results:
    user_id = result["user_id"]

    candidate = next(
        item for item in candidate_profiles
        if item["user_id"] == user_id
    )

    print(f"Rank {result['rank']} / user_id {user_id}")
    print(f"final_score: {result['final_score']}")
    print(f"embedding_score: {result['embedding_score']}")
    print(f"trait_score: {result['trait_score']}")
    print(f"emotion_label 기록용: {candidate['emotion_label']}")
    print(f"matched_traits: {result['matched_traits']}")

    print("\n후보 편지 내용:")
    print(candidate["content"])

    print("\n후보 traits:")
    for trait in candidate["traits"]:
        print("-", trait["label"], trait["score"])

    print("-" * 60)