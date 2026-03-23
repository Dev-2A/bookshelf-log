from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.book import Book
from backend.app.models.review import Review
from backend.app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewWithBook,
)
from backend.app.services.embedding import embedding_service

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


def _to_response(review: Review) -> ReviewResponse:
    """Review ORM → ReviewResponse 변환"""
    return ReviewResponse(
        id=review.id,
        book_id=review.book_id,
        content=review.content,
        rating=review.rating,
        has_embedding=review.embedding is not None,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


def _to_response_with_book(review: Review) -> ReviewWithBook:
    """Review ORM → ReviewWithBook 변환"""
    return ReviewWithBook(
        id=review.id,
        book_id=review.book_id,
        content=review.content,
        rating=review.rating,
        has_embedding=review.embedding is not None,
        created_at=review.created_at,
        updated_at=review.updated_at,
        book_title=review.book.title,
        book_author=review.book.author,
        book_cover_url=review.book.cover_url,
    )


# ── 감상문 CRUD ──────────────────────────────────

@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(review_data: ReviewCreate, db: Session = Depends(get_db)):
    """감상문 작성 + 자동 임베딩 생성"""
    # 도서 존재 확인
    book = db.query(Book).filter(Book.id == review_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="도서를 찾을 수 없습니다")
    
    # 임베딩 생성
    embedding = embedding_service.encode(review_data.content)
    
    review = Review(
        book_id=review_data.book_id,
        content=review_data.content,
        rating=review_data.rating,
        embedding=embedding,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _to_response(review)


@router.get("/", response_model=list[ReviewWithBook])
def get_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, get=1, le=100),
    db: Session = Depends(get_db),
):
    """전체 감상문 목록 조회 (도서 정보 포함)"""
    reviews = db.query(Review).offset(skip).limit(limit).all()
    return [_to_response_with_book(r) for r in reviews]


@router.get("/{review_id}", response_model=ReviewWithBook)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """감상문 상세 조회"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="감상문을 찾을 수 없습니다")
    return _to_response_with_book(review)


@router.get("/book/{book_id}", response_model=list[ReviewResponse])
def get_reviews_by_book(book_id: int, db: Session = Depends(get_db)):
    """특정 도서의 감상문 목록 조회"""
    reviews = db.query(Review).filter(Review.book_id == book_id).all()
    return [_to_response(r) for r in reviews]


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
):
    """감상문 수정 (내용 변경 시 임베딩 재생성)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="감상문을 찾을 수 없습니다")

    if review_data.content is not None:
        review.content = review_data.content
        # 내용이 바뀌면 임베딩도 다시 생성
        review.embedding = embedding_service.encode(review_data.content)

    if review_data.rating is not None:
        review.rating = review_data.rating

    db.commit()
    db.refresh(review)
    return _to_response(review)


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    """감상문 삭제"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="감상문을 찾을 수 없습니다")
    db.delete(review)
    db.commit()