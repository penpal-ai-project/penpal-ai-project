from transformers import pipeline
import torch

print("Torch version:", torch.__version__)
print("GPU 사용 가능:", torch.cuda.is_available())

classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=0 if torch.cuda.is_available() else -1
)

print("성향 분석 모델 로드 완료")


candidate_labels = [
    "차분한 사람",
    "활발한 사람",
    "감성적인 사람",
    "이성적인 사람",
    "유머러스한 사람",
    "진지한 사람",
    "긍정적인 사람",
    "생각이 많은 사람",
    "낯을 가리는 사람",
    "자기표현이 많은 사람",

    "외향적인 사람",
    "내향적인 사람",
    "사람 만나는 걸 좋아하는 사람",
    "혼자 있는 걸 좋아하는 사람",
    "깊은 관계를 중요하게 생각하는 사람",
    "편하게 대화하는 걸 좋아하는 사람",
    "공감 잘하는 사람",
    "리액션이 좋은 사람",

    "외로운 상태",
    "불안한 상태",
    "스트레스 받은 상태",
    "편안한 상태",
    "지친 상태",
    "설레는 상태",
    "우울한 상태",
    "동기부여가 필요한 상태",

    "음악 좋아하는 사람",
    "운동 좋아하는 사람",
    "공부 좋아하는 사람",
    "패션 관심 있는 사람",
    "화장품 관심 있는 사람",
    "게임 좋아하는 사람",
    "영화 좋아하는 사람",
    "드라마 좋아하는 사람",
    "요리 좋아하는 사람",
    "카페 좋아하는 사람",

    "자기관리 중요하게 생각하는 사람",
    "계획적으로 사는 사람",
    "즉흥적인 사람",
    "밤에 감성 타는 사람",
    "혼자 산책 좋아하는 사람",
    "집에서 쉬는 걸 좋아하는 사람",
    "새로운 경험 좋아하는 사람",

    "다정한 사람",
    "배려심 있는 사람",
    "애정 표현이 많은 사람",
    "연락을 중요하게 생각하는 사람",
    "감정 공유를 중요하게 생각하는 사람"
]


def analyze_traits(text, top_k=12):
    result = classifier(
        text,
        candidate_labels=candidate_labels,
        multi_label=True
    )

    traits = []

    for label, score in zip(result["labels"], result["scores"]):
        traits.append({
            "label": label,
            "score": round(float(score), 4)
        })

    # 점수 높은 순으로 이미 정렬되어 나오지만, 안전하게 한 번 더 정렬
    traits.sort(key=lambda item: item["score"], reverse=True)

    # 상위 12개만 저장
    return traits[:top_k]
