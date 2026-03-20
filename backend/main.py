from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.models import Book, Review     # noqa: F401 - 모델 등록용
from backend.app.api.books import router as books_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 DB 테이블 자동 생성"""
    Base.metadata.create_all(bind=engine)
    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} 시작")
    yield
    print(f"👋 {settings.APP_NAME} 종료")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="읽은 책의 감상문을 임베딩으로 벡터화하고, 유사한 감상끼리 연결하는 독서 지식 그래프",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(books_router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }