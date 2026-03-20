from fastapi import APIRouter, HTTPException, Query

from backend.app.schemas.book import BookSearch
from backend.app.services.aladin import aladin_client

router = APIRouter(prefix="/api/books", tags=["books"])


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