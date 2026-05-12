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
    # 성향 / 분위기
    "차분한 사람",
    "활발한 사람",
    "감성적인 사람",
    "이성적인 사람",
    "유머러스한 사람",
    "진지한 사람",
    "생각이 많은 사람",
    "자기표현이 많은 사람",

    # 관계 및 대화 성향
    "깊은 관계를 중요하게 생각하는 사람",
    "편하게 대화하는 걸 좋아하는 사람",
    "공감을 중요하게 생각하는 사람",
    "논리적인 조언을 선호하는 사람",
    "감정 공유를 중요하게 생각하는 사람",
    "혼자만의 시간을 중요하게 생각하는 사람",
    "새로운 사람 만나는 걸 좋아하는 사람",
    "천천히 가까워지는 관계를 선호하는 사람",

    # 대화 스타일
    "긴 글 쓰는 걸 좋아하는 사람",
    "짧고 편한 대화를 좋아하는 사람",
    "일상 이야기를 좋아하는 사람",
    "철학적이거나 깊은 이야기를 좋아하는 사람",
    "감정과 분위기를 중요하게 생각하는 사람",
    "현실적이고 담백한 대화를 선호하는 사람",

    # 취향 / 라이프스타일
    "책이나 글 읽는 걸 좋아하는 사람",
    "영상 콘텐츠를 좋아하는 사람",
    "음악을 자주 듣는 사람",
    "예술이나 창작에 관심 있는 사람",
    "혼자 조용히 시간을 보내는 걸 좋아하는 사람",
    "밖에서 활동하는 걸 좋아하는 사람",
    "새로운 장소나 경험을 좋아하는 사람",
    "감성적인 분위기를 좋아하는 사람",

    # 생활 방식
    "계획적으로 사는 사람",
    "즉흥적인 사람"
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
