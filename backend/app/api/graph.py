from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.review import Review
from backend.app.schemas.graph import GraphData, GraphEdge
from backend.app.services.embedding import embedding_service
from backend.app.services.similarity import similarity_service

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/", response_model=GraphData)
def get_graph_data(
    threshold: float = Query(0.5, ge=0.0, le=1.0, description="유사도 임계값"),
    db: Session = Depends(get_db),
):
    """D3.js force graph용 전체 노드 + 엣지 데이터 반환"""
    data = similarity_service.build_graph_data(db, threshold=threshold)
    return data


@router.get("/edges", response_model=list[GraphEdge])
def get_all_edges(
    threshold: float = Query(0.5, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
):
    """전체 감상문 간 유사도 엣지 목록"""
    edges = similarity_service.compute_all_edges(db, threshold=threshold)
    return edges


@router.get("/edges/{review_id}", response_model=list[GraphEdge])
def get_edges_for_review(
    review_id: int,
    threshold: float = Query(0.5, ge=0.0, le=1.0),
    top_k: int = Query(None, ge=1, le=50, description="상위 K개만 반환"),
    db: Session = Depends(get_db),
):
    """특정 감상문과 연결된 유사 감상문 엣지 목록"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="감상문을 찾을 수 없습니다")
    
    edges = similarity_service.compute_edges_for_review(
        db, review_id=review_id, threshold=threshold, top_k=top_k
    )
    return edges


@router.post("/rebuild", response_model=dict)
def rebuild_embeddings(db: Session = Depends(get_db)):
    """
    임베딩이 없는 감상문의 임베딩을 일괄 생성.
    (감상문 수정 없이 임베딩만 재생성하고 싶을 때 사용)
    """
    reviews = (
        db.query(Review)
        .filter(Review.embedding.is_(None))
        .all()
    )
    
    if not reviews:
        return {"message": "모든 감상문에 임베딩이 존재합니다", "updated": 0}
    
    texts = [r.content for r in reviews]
    vectors = embedding_service.encode_batch(texts)
    
    for review, vector in zip(reviews, vectors):
        review.embedding = vector
    
    db.commit()
    
    return {
        "message": f"{len(reviews)}개 감상문의 임베딩을 생성했습니다",
        "updated": len(reviews),
    }


@router.get("/stats", response_model=dict)
def get_graph_stats(
    threshold: float = Query(0.5, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
):
    """그래프 통계 정보"""
    total_reviews = db.query(Review).count()
    embedded_reviews = (
        db.query(Review).filter(Review.embedding.isnot(None)).count()
    )
    edges = similarity_service.compute_all_edges(db, threshold=threshold)

    # 가장 많이 연결된 감상문 찾기
    connection_count: dict[int, int] = {}
    for edge in edges:
        connection_count[edge["source"]] = connection_count.get(edge["source"], 0) + 1
        connection_count[edge["target"]] = connection_count.get(edge["target"], 0) + 1

    most_connected = None
    if connection_count:
        most_connected_id = max(connection_count, key=connection_count.get)
        review = db.query(Review).filter(Review.id == most_connected_id).first()
        if review:
            most_connected = {
                "review_id": most_connected_id,
                "book_title": review.book.title,
                "connections": connection_count[most_connected_id],
            }

    return {
        "total_reviews": total_reviews,
        "embedded_reviews": embedded_reviews,
        "total_edges": len(edges),
        "threshold": threshold,
        "most_connected": most_connected,
        "avg_similarity": round(
            sum(e["similarity"] for e in edges) / len(edges), 4
        ) if edges else 0,
    }