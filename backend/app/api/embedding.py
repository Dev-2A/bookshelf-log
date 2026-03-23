from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.embedding import embedding_service


router = APIRouter(prefix="/api/embedding", tags=["embedding"])


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    text: str
    dimension: int
    vector_preview: list[float]     # 앞 10개만


class SimilarityRequest(BaseModel):
    text_a: str
    text_b: str


class SimilarityResponse(BaseModel):
    text_a: str
    text_b: str
    similarity: float


@router.post("/encode", response_model=EmbedResponse)
def encode_text(req: EmbedRequest):
    """텍스트를 임베딩 벡터로 변환 (테스트용)"""
    vector = embedding_service.encode(req.text)
    return EmbedResponse(
        text=req.text,
        dimension=len(vector),
        vector_preview=vector[:10],
    )


@router.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(req: SimilarityRequest):
    """두 텍스트 간 유사도 계산 (테스트용)"""
    vec_a = embedding_service.encode(req.text_a)
    vec_b = embedding_service.encode(req.text_b)
    sim = embedding_service.cosine_similarity(vec_a, vec_b)
    return SimilarityResponse(
        text_a=req.text_a,
        text_b=req.text_b,
        similarity=round(sim, 4),
    )


@router.get("/info")
def embedding_info():
    """임베딩 모델 정보"""
    return {
        "model": embedding_service.model.model_card_data.model_name or "BAAI/bge-m3",
        "dimension": embedding_service.get_dimension(),
    }