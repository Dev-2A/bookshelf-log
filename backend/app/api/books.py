from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.book import Book
from backend.app.schemas.book import BookCreate, BookResponse, BookSearch
from backend.app.services.aladin import aladin_client

router = APIRouter(prefix="/api/books", tags=["books"])


# ── 알라딘 검색 ──────────────────────────────────

@router.get("/search", response_model=list[BookSearch])
def search_books(
    q: str = Query(..., min_length=1, description="검색 키워드"),
    max_results: int = Query(10, ge=1, le=50, description="최대 결과 수"),
):
    """알라딘 API로 도서 검색"""
    try:
        results = aladin_client.search_books(query=q, max_results=max_results)
        return results
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"알라딘 API 오류: {str(e)}")


@router.get("/lookup/{isbn}", response_model=BookSearch)
def lookup_book(isbn: str):
    """ISBN으로 도서 상세 조회"""
    try:
        result = aladin_client.lookup_by_isbn(isbn=isbn)
        if not result:
            raise HTTPException(status_code=404, detail="도서를 찾을 수 없습니다")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"알라딘 API 오류: {str(e)}")


# ── 도서 CRUD ────────────────────────────────────

@router.post("/", response_model=BookResponse, status_code=201)
def create_book(book_data: BookCreate, db: Session = Depends(get_db)):
    """도서 등록 (알라딘 검색 결과 또는 수동 입력)"""
    # ISBN 중복 체크
    if book_data.isbn:
        existing = db.query(Book).filter(Book.isbn == book_data.isbn).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"이미 등록된 도서입니다 (id: {existing.id})",
            )
    
    book = Book(**book_data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("/", response_model=list[BookResponse])
def get_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """등록된 도서 목록 조회"""
    books = db.query(Book).offset(skip).limit(limit).all()
    return books


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """도서 상세 조회"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="도서를 찾을 수 없습니다")
    return book


@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    """도서 삭제 (연결된 감상문도 함께 삭제)"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="도서를 찾을 수 없습니다")
    db.delete(book)
    db.commit()