from datetime import datetime

from pydantic import BaseModel


class BookCreate(BaseModel):
    """도서 등록 요청"""
    
    isbn: str | None = None
    title: str
    author: str
    publisher: str | None = None
    cover_url: str | None = None
    description: str | None = None
    pub_date: str | None = None
    category: str | None = None
    link: str | None = None


class BookResponse(BaseModel):
    """도서 응답"""
    
    id: int
    isbn: str | None
    title: str
    author: str
    publisher: str | None
    cover_url: str | None
    description: str | None
    pub_date: str | None
    category: str | None
    link: str | None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class BookSearch(BaseModel):
    """알라딘 도서 검색 결과"""
    
    isbn: str
    title: str
    author: str
    publisher: str
    cover_url: str
    description: str
    pub_date: str
    category: str
    link: str