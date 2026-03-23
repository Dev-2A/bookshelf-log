import numpy as np
from sentence_transformers import SentenceTransformer

from backend.app.core.config import settings


class EmbeddingService:
    """BGE-M3 기반 텍스트 임베딩 서비스"""
    
    def __init__(self):
        self._model = None
    
    @property
    def model(self) -> SentenceTransformer:
        """모델 지연 로딩 (첫 호출 시에만 로드)"""
        if self._model is None:
            print(f"🔄 임베딩 모델 로딩 중: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            print(f"✅ 임베딩 모델 로딩 완료 (차원: {self._model.get_sentence_embedding_dimension()})")
        return self._model
    
    def encode(self, text: str) -> list[float]:
        """텍스트 → 임베딩 벡터 변환"""
        vector = self.model.encode(text, normalize_embeddings=True)
        return vector.tolist()
    
    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """여러 텍스트 → 임베딩 벡터 일괄 변환"""
        vectors = self.model.encode(texts, normalize_embeddings=True)
        return vectors.tolist()
    
    def cosine_similarity(self, vec_a: list[float], vec_b: list[float]) -> float:
        """두 벡터 간 코사인 유사도 계산"""
        a = np.array(vec_a)
        b = np.array(vec_b)
        
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))
    
    def find_similar(
        self,
        target_vector: list[float],
        candidates: list[dict],
        threshold: float | None = None,
        top_k: int | None = None,
    ) -> list[dict]:
        """
        타겟 벡터와 후보 벡터들 간의 유사도를 계산하여 반환.
        
        Args:
            target_vector: 비교 기준 벡터
            candidates: [{"id": int, "vector": list[float]}, ...]
            threshold: 유사도 하한 (기본: settings.SIMILARITY_THRESHOLD)
            top_k: 상위 K개만 반환 (None이면 threshold 이상 전부)
        
        Returns:
            [{"id": int, "similarity": float}, ...] - 유사도 내림차순 정렬
        """
        if threshold is None:
            threshold = settings.SIMILARITY_THRESHOLD
        
        results = []
        for candidate in candidates:
            sim = self.cosine_similarity(target_vector, candidate["vector"])
            if sim >= threshold:
                results.append({
                    "id": candidate["id"],
                    "similarity": round(sim, 4),
                })
        
        results.sort(key=lambda x: x["similarity"], reverse=True)
        
        if top_k is not None:
            results = results[:top_k]
        
        return results
    
    def get_dimension(self) -> int:
        """임베딩 벡터 차원 수 반환"""
        return self.model.get_sentence_embedding_dimension()


# 싱글턴 인스턴스
embedding_service = EmbeddingService()