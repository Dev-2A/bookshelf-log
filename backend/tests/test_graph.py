def test_graph_empty(client):
    """빈 그래프 데이터 조회"""
    response = client.get("/api/graph/")
    assert response.status_code == 200
    data = response.json()
    assert data["nodes"] == []
    assert data["edges"] == []


def test_graph_with_data(client):
    """감상문 등록 후 그래프 데이터 확인"""
    # 도서 2권 등록
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/books/", json={"title": "싯다르타", "author": "헤르만 헤세"})

    # 유사한 주제의 감상문 2개 작성
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "자아를 찾아가는 여정이 깊은 울림을 준다. 성장과 방황의 이야기.",
        "rating": 5,
    })
    client.post("/api/reviews/", json={
        "book_id": 2,
        "content": "깨달음을 향한 구도자의 여정. 자기 자신을 찾아가는 과정이 인상적.",
        "rating": 4,
    })

    # 낮은 임계값으로 조회 (연결이 보이도록)
    response = client.get("/api/graph/?threshold=0.3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) == 2
    # 유사한 주제이므로 엣지가 존재해야 함
    assert len(data["edges"]) >= 1


def test_graph_stats(client):
    """그래프 통계 조회"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "자아를 찾아가는 여정",
    })
    response = client.get("/api/graph/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 1
    assert data["embedded_reviews"] == 1


def test_rebuild_embeddings(client):
    """임베딩 일괄 재생성 (이미 전부 존재하는 경우)"""
    client.post("/api/books/", json={"title": "데미안", "author": "헤르만 헤세"})
    client.post("/api/reviews/", json={
        "book_id": 1,
        "content": "테스트 감상문",
    })
    response = client.post("/api/graph/rebuild")
    assert response.status_code == 200
    assert response.json()["updated"] == 0