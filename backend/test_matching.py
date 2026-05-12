from create_embedding import create_embedding
from trait_analysis import analyze_traits
from matching_score import rank_matching_candidates


target_user_id = 1

target_text = "요즘 혼자 산책하면서 음악을 들으면 마음이 편안해져. 누군가와 감정을 나누고 싶기도 해."

candidate_text_1 = "밤에 혼자 걸으면서 노래를 들으면 복잡한 생각이 정리되고 마음이 차분해져."
candidate_text_2 = "나는 사람들과 모임에서 이야기하고 활발하게 노는 시간이 제일 즐거워."
candidate_text_3 = "요즘 공부도 해야 하고 할 일이 많아서 조금 지치지만, 음악을 들으면 위로가 돼."


target_embedding = create_embedding(target_text)
target_traits = analyze_traits(target_text)

candidate_profiles = [
    {
        "user_id": 2,
        "embedding": create_embedding(candidate_text_1),
        "traits": analyze_traits(candidate_text_1)
    },
    {
        "user_id": 3,
        "embedding": create_embedding(candidate_text_2),
        "traits": analyze_traits(candidate_text_2)
    },
    {
        "user_id": 4,
        "embedding": create_embedding(candidate_text_3),
        "traits": analyze_traits(candidate_text_3)
    }
]

matches = rank_matching_candidates(
    target_user_id=target_user_id,
    target_embedding=target_embedding,
    target_traits=target_traits,
    candidate_profiles=candidate_profiles,
    top_k=3
)

print("\n매칭 결과")
print(matches)