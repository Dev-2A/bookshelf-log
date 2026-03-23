from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.review import Review
from backend.app.services.embedding import embedding_service


class SimilarityService:
    """감상문 간 유사도 계산 및 그래프 엣지 생성 서비스"""
    
    def compute_all_edges(
        self,
        db: Session,
        threshold: float | None = None,
    ) -> list[dict]:
        """
        모든 감상문 쌍의 유사도를 계산하고, 임계값 이상인 쌍만 그래프 엣지로 반환.
        
        Returns:
            [{"souorce": review_id, "target": review_id, "similarity": float}, ...]
        """
        if threshold is None:
            threshold = settings.SIMILARITY_THRESHOLD
        
        # 임베딩이 존재하는 감상문만 조회
        reviews = (
            db.query(Review)
            .filter(Review.embedding.isnot(None))
            .all()
        )
        
        if len(reviews) < 2:
            return []
        
        edges = []
        for i in range(len(reviews)):
            for j in range(i + 1, len(reviews)):
                sim = embedding_service.cosine_similarity(
                    reviews[i].embedding,
                    reviews[j].embedding,
                )
                if sim >= threshold:
                    edges.append({
                        "source": reviews[i].id,
                        "target": reviews[j].id,
                        "similarity": round(sim, 4),
                    })
        
        # 유사도 내림차순 정렬
        edges.sort(key=lambda x: x["similarity"], reverse=True)
        return edges
    
    def compute_edges_for_review(
        self,
        db: Session,
        review_id: int,
        threshold: float | None = None,
        top_k: int | None = None,
    ) -> list[dict]:
        """
        특정 감상문과 나머지 감상문들 간의 유사도 계산.
        
        Returns:
            [{"source": review_id, "target": review_id, "similarity": float}, ...]
        """
        if threshold is None:
            threshold = settings.SIMILARITY_THRESHOLD
        
        target_review = db.query(Review).filter(Review.id == review_id).first()
        if not target_review or target_review.embedding is None:
            return []
        
        other_reviews = (
            db.query(Review)
            .filter(Review.id != review_id, Review.embedding.isnot(None))
            .all()
        )
        
        candidates = [
            {"id": r.id, "vector": r.embedding}
            for r in other_reviews
        ]
        
        similar = embedding_service.find_similar(
            target_vector=target_review.embedding,
            candidates=candidates,
            threshold=threshold,
            top_k=top_k,
        )
        
        return [
            {
                "source": review_id,
                "target": item["id"],
                "similarity": item["similarity"],
            }
            for item in similar
        ]
    
    def build_graph_data(
        self,
        db: Session,
        threshold: float | None = None,
    ) -> dict:
        """
        D3.js force graph에 필요한 노드 + 엣지 데이터 생성.

        Returns:
            {
                "nodes": [{"id": review_id, "book_id": int, "title": str, ...}, ...],
                "edges": [{"source": review_id, "target": review_id, "similarity": float}, ...]
            }
        """
        if threshold is None:
            threshold = settings.SIMILARITY_THRESHOLD
        
        reviews = (
            db.query(Review)
            .filter(Review.embedding.isnot(None))
            .all()
        )
        
        # 노드 생성
        nodes = []
        for review in reviews:
            book = review.book
            nodes.append({
                "id": review.id,
                "book_id": book.id,
                "title": book.title,
                "author": book.author,
                "cover_url": book.cover_url,
                "rating": review.rating,
                "content_preview": review.content[:100] + "..."
                if len(review.content) > 100
                else review.content,
                "created_at": review.created_at.isoformat(),
            })
        
        #엣지 생성
        edges = self.compute_all_edges(db, threshold=threshold)
        
        return {
            "nodes": nodes,
            "edges": edges,
        }


# 싱글턴 인스턴스
similarity_service = SimilarityService()