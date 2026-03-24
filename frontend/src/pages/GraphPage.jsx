import { useState, useEffect } from "react";
import { getGraphData, getGraphStats } from "../api";
import ForceGraph from "../components/ForceGraph";
import NodeDetail from "../components/NodeDetail";

export default function GraphPage() {
  const [graphData, setGraphData] = useState(null);
  const [stats, setStats] = useState(null);
  const [threshold, setThreshold] = useState(0.4);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraph();
  }, [threshold]);

  const loadGraph = async () => {
    setLoading(true);
    setSelectedNode(null);
    try {
      const [dataRes, statsRes] = await Promise.all([
        getGraphData(threshold),
        getGraphStats(threshold),
      ]);
      setGraphData(dataRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("그래프 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-wood-800">
          🕸️ 독서 지식 그래프
        </h1>
        <button
          onClick={loadGraph}
          disabled={loading}
          className="px-4 py-2 text-sm bg-wood-100 text-wood-600 rounded-xl hover:bg-wood-200 disabled:opacity-50 transition-colors"
        >
          {loading ? "새로고침 중..." : "🔄 새로고침"}
        </button>
      </div>

      {/* 통계 + 컨트롤 */}
      <div className="flex flex-wrap items-center gap-6 bg-white bg-opacity-70 rounded-2xl p-5 border border-wood-200 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-wood-600 whitespace-nowrap">
            유사도 기준
          </label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-36 accent-warm-500"
          />
          <span className="text-sm font-mono text-warm-600 w-12">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>

        {stats && (
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1.5 bg-wood-50 rounded-full text-wood-600">
              📝 감상문 <b className="text-wood-800">{stats.total_reviews}</b>개
            </span>
            <span className="px-3 py-1.5 bg-wood-50 rounded-full text-wood-600">
              🔗 연결 <b className="text-wood-800">{stats.total_edges}</b>개
            </span>
            {stats.avg_similarity > 0 && (
              <span className="px-3 py-1.5 bg-warm-50 rounded-full text-warm-700">
                평균 유사도 <b>{(stats.avg_similarity * 100).toFixed(1)}%</b>
              </span>
            )}
            {stats.most_connected && (
              <span className="px-3 py-1.5 bg-warm-50 rounded-full text-warm-700">
                🌟 허브: <b>{stats.most_connected.book_title}</b>(
                {stats.most_connected.connections}개 연결)
              </span>
            )}
          </div>
        )}
      </div>

      {/* 그래프 영역 */}
      <div className="relative bg-white bg-opacity-70 rounded-2xl border border-wood-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-4xl mb-3 animate-pulse">📖</p>
              <p className="text-wood-400">그래프를 그리는 중...</p>
            </div>
          </div>
        ) : !graphData || graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-5xl mb-4">🌱</p>
              <h2 className="text-lg font-semibold text-wood-700 mb-2">
                아직 그래프가 비어 있어요
              </h2>
              <p className="text-wood-400 max-w-sm">
                도서를 등록하고 감상문을 작성하면, 비슷한 감상끼리 연결된 지식
                그래프가 나타납니다.
              </p>
            </div>
          </div>
        ) : graphData.nodes.length === 1 ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-5xl mb-4">🌿</p>
              <h2 className="text-lg font-semibold text-wood-700 mb-2">
                첫 번째 감상이 등록되었어요!
              </h2>
              <p className="text-wood-400 max-w-sm">
                감상문을 하나 더 작성하면 유사도 연결이 시작됩니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ForceGraph
              data={graphData}
              onNodeClick={(node) => setSelectedNode(node)}
            />

            {/* 범례 */}
            <div className="absolute bottom-4 left-4 bg-cream bg-opacity-90 rounded-xl px-4 py-3 text-xs text-wood-500 border border-wood-100">
              <p className="font-medium text-wood-600 mb-1">사용법</p>
              <p>🖱️ 드래그: 노드 이동 · 스크롤: 확대/축소</p>
              <p>👆 호버: 연결 강조 · 클릭: 상세 보기</p>
              <p className="mt-1 text-wood-400">
                선이 굵을수록 유사도가 높아요
              </p>
            </div>

            {/* 노드 상세 패널 */}
            {selectedNode && (
              <div className="absolute top-4 right-4">
                <NodeDetail
                  node={selectedNode}
                  edges={graphData.edges}
                  allNodes={graphData.nodes}
                  onClose={() => setSelectedNode(null)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
