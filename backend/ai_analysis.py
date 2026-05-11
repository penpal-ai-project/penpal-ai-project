from create_embedding import create_embedding
from emotion_model import extract_emotion
from trait_analysis import analyze_traits


def analyze_text(content):
    """
    편지 내용을 받아서
    1. KoE5 벡터 변환
    2. 감정 추출
    3. 성향 분석
    결과를 하나로 묶어 반환하는 함수
    """

    embedding = create_embedding(content)
    emotion = extract_emotion(content)
    traits = analyze_traits(content)

    return {
        "embedding": embedding,
        "emotion_label": emotion["label"],
        "emotion_score": emotion["score"],
        "traits": traits
    }