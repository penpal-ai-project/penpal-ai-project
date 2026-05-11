from transformers import pipeline
import torch

# 감정 분석 모델 로드
# 서버가 시작될 때 한 번만 로드됨
emotion_classifier = pipeline(
    "text-classification",
    model="taehoon222/korean-emotion-classifier-final",
    device=0 if torch.cuda.is_available() else -1
)


def extract_emotion(text):
    """
    편지 내용을 분석해서 감정 라벨과 점수를 반환하는 함수
    """

    result = emotion_classifier(text)

    top_result = result[0]

    return {
        "label": top_result["label"],
        "score": float(top_result["score"])
    }