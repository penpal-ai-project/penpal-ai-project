from create_embedding import create_embedding
from emotion_model import extract_emotion
from trait_analysis import analyze_traits


def analyze_text(text):
    embedding = create_embedding(text)
    emotion_result = extract_emotion(text)
    traits = analyze_traits(text, top_k=12)

    return {
        "embedding": embedding,

        # emotion은 매칭에 사용하지 않고,
        # 나중에 본인 감정 기록 / 마이페이지 통계용으로만 저장
        "emotion_label": emotion_result["label"],
        "emotion_score": emotion_result["score"],

        # traits는 매칭 점수 계산에 사용
        "traits": traits
    }