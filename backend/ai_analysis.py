# ai_analysis.py

from create_embedding import create_embedding
from emotion_model import extract_emotion
from trait_analysis import analyze_traits


def analyze_text(content):
    """
    글 하나를 받아서 AI 분석 결과를 반환

    사용처:
    - profile_letter 분석
    - 새 편지 분석
    - user_profile 업데이트
    """

    # 임베딩 생성
    embedding = create_embedding(content)

    # 감정 분석
    emotion = extract_emotion(content)

    # 성향 분석
    traits = analyze_traits(content)

    # 전체 결과 반환
    return {
        "embedding": embedding,

        "emotion_label": emotion["label"],
        "emotion_score": emotion["score"],

        "traits": traits
    }