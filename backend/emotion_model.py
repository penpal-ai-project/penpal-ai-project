from transformers import pipeline
import torch

print("Torch version:", torch.__version__)
print("GPU 사용 가능:", torch.cuda.is_available())

emotion_pipe = pipeline(
    "text-classification",
    model="taehoon222/korean-emotion-classifier-final",
    tokenizer="taehoon222/korean-emotion-classifier-final",
    device=0 if torch.cuda.is_available() else -1,
    top_k=None
)

print("감정 분석 모델 로드 완료")


def extract_emotion(text):
    result = emotion_pipe(text)[0]

    best = max(result, key=lambda x: x["score"])

    return {
        "label": best["label"],
        "score": float(best["score"]),
        "full_result": result
    }
