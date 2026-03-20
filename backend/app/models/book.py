from datetime import datetime

from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base


class Book(Base):
    """도서 정보 테이블"""
    
    __tablename__ = "books"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    isbn: Mapped[str] = mapped_column(String(13), unique=True, nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    author: Mapped[str] = mapped_column(String(200), nullable=False)
    publisher: Mapped[str] = mapped_column(String(100), nullable=True)
    cover_url: Mapped[str] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    pub_date: Mapped[str] = mapped_column(String(20), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    link: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    
    # 관계: 한 권의 책 → 여러 감상문
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}')>"