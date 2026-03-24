def test_create_book(client):
    """도서 등록 테스트"""
    response = client.post("/api/books/", json={
        "title": "데미안",
        "author": "헤르만 헤세",
        "isbn": "9788937460449",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "데미안"
    assert data["author"] == "헤르만 헤세"
    assert data["id"] == 1


def test_create_duplicate_isbn(client):
    """ISBN 중복 등록 방지 테스트"""
    book = {"title": "데미안", "author": "헤르만 헤세", "isbn": "9788937460449"}
    client.post("/api/books/", json=book)
    response = client.post("/api/books/", json=book)
    assert response.status_code == 409


def test_get_books_empty(client):
    """빈 도서 목록 조회 테스트"""
    response = client.get("/api/books/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_books(client):
    """도서 목록 조회 테스트"""
    client.post("/api/books/", json={"title": "책1", "author": "저자1"})
    client.post("/api/books/", json={"title": "책2", "author": "저자2"})
    response = client.get("/api/books/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_book_detail(client):
    """도서 상세 조회 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    response = client.get("/api/books/1")
    assert response.status_code == 200
    assert response.json()["title"] == "데미안"


def test_get_book_not_found(client):
    """존재하지 않는 도서 조회 테스트"""
    response = client.get("/api/books/999")
    assert response.status_code == 404


def test_delete_book(client):
    """도서 삭제 테스트"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    response = client.delete("/api/books/1")
    assert response.status_code == 204

    response = client.get("/api/books/")
    assert len(response.json()) == 0