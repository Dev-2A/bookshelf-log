from datetime import datetime

from sqlalchemy import Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base


class Review(Base):
    """감상문 테이블"""
    
    __tablename__ = "reviews"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    book_id: Mapped[int] = mapped_column(Integer, ForeignKey("books.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=True) # 1~5점
    embedding: Mapped[dict | None] = mapped_column(JSON, nullable=True) # 벡터 저장
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    
    # 관계
    book = relationship("Book", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review(id={self.id} book_id={self.book_id})>"