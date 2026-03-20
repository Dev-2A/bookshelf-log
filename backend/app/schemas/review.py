from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    """감상문 작성 요청"""
    
    book_id: int
    content: str = Field(..., min_length=1, max_length=5000)
    rating: int | None = Field(None, ge=1, le=5)


class ReviewUpdate(BaseModel):
    """감상문 수청 요청"""
    
    content: str | None = Field(None, min_length=1, max_length=5000)
    rating: int | None = Field(None, ge=1, le=5)


class ReviewResponse(BaseModel):
    """감상문 응답"""
    
    id: int
    book_id: int
    content: str
    rating: int | None
    has_embedding: bool     # 임베딩 존재 여부
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ReviewWithBook(ReviewResponse):
    """도서 정보 포함 감상문 응답"""
    
    book_title: str
    book_author: str
    book_cover_url: str | None