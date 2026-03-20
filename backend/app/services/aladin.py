import requests

from backend.app.core.config import settings
from backend.app.schemas.book import BookSearch


class AladinClient:
    """알라딘 Open API 클라이언트"""
    
    def __init__(self):
        self.api_key = settings.ALADIN_API_KEY
        self.base_url = settings.ALADIN_BASE_URL
    
    def search_books(self, query: str, max_results: int = 10) -> list[BookSearch]:
        """도서 검색 (제목/저자 키워드)"""
        url = f"{self.base_url}/ItemSearch.aspx"
        params = {
            "ttbkey": self.api_key,
            "Query": query,
            "QueryType": "Keyword",
            "MaxResults": max_results,
            "Start": 1,
            "SearchTarget": "Book",
            "Output": "js",
            "Version": "20131101",
            "Cover": "Big",
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("item", [])
        return [self._parse_item(item) for item in items]
    
    def lookup_by_isbn(self, isbn: str) -> BookSearch | None:
        """ISBN으로 도서 상세 조회"""
        url = f"{self.base_url}/ItemLookUp.aspx"
        params = {
            "ttbkey": self.api_key,
            "ItemId": isbn,
            "ItemIdType": "ISBN13",
            "Output": "js",
            "Version": "20131101",
            "Cover": "Big",
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("item", [])
        if not items:
            return None
        return self._parse_item(items[0])
    
    def _parse_item(self, item: dict) -> BookSearch:
        """알라딘 API 응답 → BookSearch 스키마 변환"""
        return BookSearch(
            isbn=item.get("isbn13", "") or item.get("isbn", ""),
            title=item.get("title", ""),
            author=item.get("author", ""),
            publisher=item.get("publisher", ""),
            cover_url=item.get("cover", ""),
            description=item.get("description", ""),
            pub_date=item.get("pubDate", ""),
            category=item.get("categoryName", ""),
            link=item.get("link", ""),
        )


# 싱글턴 인스턴스
aladin_client = AladinClient()