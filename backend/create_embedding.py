from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nlpai-lab/KoE5")

print("KoE5 모델 로드 완료")


def create_embedding(text):

    formatted_text = "query: " + text

    embedding = model.encode(
        formatted_text,
        convert_to_tensor=False
    )

    return embedding.tolist()
