from sentence_transformers import SentenceTransformer

# KoE5 임베딩 모델 로드
# 서버가 시작될 때 한 번만 로드됨
embedding_model = SentenceTransformer("nlpai-lab/KoE5")


def create_embedding(text):
    """
    편지 내용을 KoE5 임베딩 벡터로 변환하는 함수
    """

    # KoE5 모델 권장 입력 형식
    input_text = "query: " + text

    # 문장을 벡터로 변환
    embedding = embedding_model.encode(
        input_text,
        convert_to_tensor=False
    )

    # DB에 JSON 형태로 저장하기 위해 list로 변환
    return embedding.tolist()