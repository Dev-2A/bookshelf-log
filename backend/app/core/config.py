from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 앱 기본
    APP_NAME: str = "BookShelf.log"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # 데이터베이스
    DATABASE_URL: str = "sqlite:///./bookshelf.db"
    
    # 알라딘 API
    ALADIN_API_KEY: str = ""
    ALADIN_BASE_URL: str = "http://www.aladin.co.kr/ttb/api"
    
    # 임베딩 모델
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    SIMILARITY_THRESHOLD: float = 0.5
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()