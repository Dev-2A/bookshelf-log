def test_create_review(client):
    """감상문 작성 + 자동 임베딩 생성 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    response = client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "자아를 찾아가는 여정이 인상적이다.",
        "rating": 5,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["book_id"] == 1
    assert data["has_embedding"] is True
    assert data["rating"] == 5


def test_create_review_book_not_found(client):
    """존재하지 않는 도서에 감상문 작성 시도"""
    response = client.post("/api/reviews/", json={
        "book_id": 999,
        "content": "테스트 감상문",
    })
    assert response.status_code == 404


def test_get_reviews(client):
    """감상문 목록 조회 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "깊은 울림을 주는 책이다.",
        "rating": 4,
    })
    response = client.get("/api/reviews/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["book_title"] == "데미안"


def test_update_review(client):
    """감상문 수정 + 임베딩 재생성 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "원래 감상문 내용",
        "rating": 3,
    })
    response = client.put("/api/reviews/1", json={
        "content": "수정된 감상문 내용으로 변경합니다.",
        "rating": 5,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 5
    assert data["has_embedding"] is True


def test_delete_review(client):
    """감상문 삭제 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "삭제될 감상문",
    })
    response = client.delete("/api/reviews/1")
    assert response.status_code == 204


def test_delete_book_cascades_reviews(client):
    """도서 삭제 시 연결된 감상문도 함께 삭제"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "카스케이드 삭제 테스트",
    })
    client.delete("/api/books/1")
    response = client.get("/api/reviews/")
    assert len(response.json()) == 0