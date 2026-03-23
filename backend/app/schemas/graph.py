from pydantic import BaseModel


class GraphNode(BaseModel):
    """그래프 노드 (감상문 1개 = 노드 1개)"""
    
    id: int
    book_id: int
    title: str
    author: str
    cover_url: str | None
    rating: int | None
    content_preview: str
    created_at: str


class GraphEdge(BaseModel):
    """그래프 엣지 (감상문 간 유사도 연결)"""
    
    source: int
    target: int
    similarity: float


class GraphData(BaseModel):
    """D3.js force graph용 전체 데이터"""
    
    nodes: list[GraphNode]
    edges: list[GraphEdge]