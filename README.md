# 📖 BookShelf.log

읽은 책의 감상문을 **BGE-M3 임베딩**으로 벡터화하고,  
유사한 감상끼리 연결하는 **인터랙티브 독서 지식 그래프**입니다.

> 사서의 시선으로 책을 분류하고, 엔지니어의 손으로 연결합니다.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 주요 기능

### 📚 도서 관리

- 알라딘 Open API로 도서 검색 → 표지·메타데이터 자동 수집
- ISBN 중복 체크, 도서 등록/삭제

### ✍️ 감상문

- 감상문 작성 시 BGE-M3 임베딩 자동 생성
- 감상문 수정 시 임베딩 자동 재생성
- 1~5점 별점 시스템

### 🕸️ 지식 그래프

- 코사인 유사도 기반 감상문 간 연결
- D3.js force graph로 인터랙티브 시각화
- 유사도 임계값 슬라이더로 연결 강도 조절
- 노드 호버 시 연결 강조, 클릭 시 상세 패널
- 드래그·줌 지원

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLAlchemy, SQLite |
| Embedding | BGE-M3 (BAAI/bge-m3, 1024차원) |
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Visualization | D3.js (force simulation) |
| External API | 알라딘 Open API |
| Test | pytest, httpx |

## 아키텍처

```text
사용자 → React (Vite) → FastAPI
                            ├── 알라딘 API (도서 검색)
                            ├── BGE-M3 (감상문 임베딩)
                            ├── 유사도 계산 (코사인)
                            └── SQLite (도서·감상문·벡터 저장)
                                    ↓
                          D3.js Force Graph (시각화)
```

## 시작하기

### 사전 요구사항

- Python 3.11+
- Node.js 18+
- 알라딘 Open API 키 ([발급 페이지](https://www.aladin.co.kr/ttb/wblog_manage.aspx))

### 설치 및 실행

**1. 레포지토리 클론**

```bash
git clone https://github.com/Dev-2A/bookshelf-log.git
cd bookshelf-log
```

**2. 백엔드 설정**

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

**3. 환경 변수 설정**

프로젝트 루트에 `.env` 파일 생성:

```env
ALADIN_API_KEY=발급받은_API_키
DEBUG=True
```

**4. 백엔드 서버 실행**

```bash
cd ..
python -m uvicorn backend.main:app --reload
```

> 첫 실행 시 BGE-M3 모델 다운로드가 진행됩니다 (약 2.2GB).

**5. 프론트엔드 설정 및 실행** (새 터미널)

```bash
cd  frontend
npm install
npm run dev
```

**6. 브라우저 접속**

- 프론트엔드: http://localhost:5173
- API 문서 (Swagger): http://localhost:8000/docs

## 사용 방법

1. **📚 서재** 탭에서 알라딘 검색으로 도서를 등록합니다.
2. **✍️ 감상문** 탭에서 등록된 도서를 선택하고 감상문을 작성합니다.
3. **📊 그래프** 탭에서 감상문 간 유사도 연결을 확인합니다.
4. 유사도 슬라이더를 조절하여 연결 기준을 변경할 수 있습니다.
5. 노드를 클릭하면 상세 정보와 유사한 감상 목록을 볼 수 있습니다.

## API 엔드포인트

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/books/search?q=` | 알라딘 도서 검색 |
| GET | `/api/books/lookup/{isbn}` | ISBN 도서 조회 |
| POST | `/api/books/` | 도서 등록 |
| GET | `/api/books/` | 도서 목록 |
| DELETE | `/api/books/{id}` | 도서 삭제 |
| POST | `/api/reviews/` | 감상문 작성 (+ 임베딩 자동 생성) |
| GET | `/api/reviews/` | 감상문 목록 |
| PUT | `/api/reviews/{id}` | 감상문 수정 (+ 임베딩 재생성) |
| DELETE | `/api/reviews/{id}` | 감상문 삭제 |
| GET | `/api/graph/?threshold=` | 그래프 데이터 (노드 + 엣지) |
| GET | `/api/graph/stats` | 그래프 통계 |
| POST | `/api/graph/rebuild` | 임베딩 일괄 재생성 |

## 프로젝트 구조

```text
bookshelf-log/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI 라우터
│   │   │   ├── books.py
│   │   │   ├── reviews.py
│   │   │   ├── embedding.py
│   │   │   └── graph.py
│   │   ├── core/          # 설정, DB 연결
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/        # SQLAlchemy 모델
│   │   │   ├── book.py
│   │   │   └── review.py
│   │   ├── schemas/       # Pydantic 스키마
│   │   │   ├── book.py
│   │   │   ├── review.py
│   │   │   └── graph.py
│   │   └── services/      # 비즈니스 로직
│   │       ├── aladin.py
│   │       ├── embedding.py
│   │       └── similarity.py
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ForceGraph.jsx
│   │   │   └── NodeDetail.jsx
│   │   ├── pages/
│   │   │   ├── GraphPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   └── ReviewsPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── .env
├── .gitignore
├── LICENSE
└── README.md
```

## 만든 이유

전직 사서로서 책을 분류하고 연결하는 일에 익숙했고,
AI/ML 엔지니어로서 임베딩 모델을 다루는 일이 일상이 되었습니다.

이 두 경험의 교차점에서 "내가 읽은 책들의 감상이 어떻게 연결되어 있을까?"라는
질문에 답하기 위해 이 프로젝트를 만들었습니다.

단순한 독서 기록 앱이 아니라, 감상의 유사도를 벡터로 계산하고
그래프로 시각화함으로써 나만의 독서 세계를 한눈에 볼 수 있습니다.

## License

MIT License
