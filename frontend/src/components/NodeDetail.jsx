import { useState, useEffect } from "react";
import { getReviewsByBook } from "../api";

export default function NodeDetail({ node, edges, allNodes, onClose }) {
  const [otherReviews, setOtherReviews] = useState([]);

  useEffect(() => {
    if (node?.book_id) {
      getReviewsByBook(node.book_id)
        .then((res) =>
          setOtherReviews(res.data.filter((r) => r.id !== node.id)),
        )
        .catch(() => setOtherReviews([]));
    }
  }, [node]);

  if (!node) return null;

  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

  // 연결된 노드 정보
  const connections = edges
    .filter((e) => {
      const src = typeof e.source === "object" ? e.source.id : e.source;
      const tgt = typeof e.target === "object" ? e.target.id : e.target;
      return src === node.id || tgt === node.id;
    })
    .map((e) => {
      const src = typeof e.source === "object" ? e.source.id : e.source;
      const tgt = typeof e.target === "object" ? e.target.id : e.target;
      const connectedId = src === node.id ? tgt : src;
      const connectedNode = allNodes.find((n) => n.id === connectedId);
      return { ...connectedNode, similarity: e.similarity };
    })
    .filter(Boolean)
    .sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="bg-white bg-opacity-95 rounded-2xl border border-wood-200 shadow-lg w-80 max-h-[560px] overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white bg-opacity-95 p-5 pb-3 border-b border-wood-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {node.cover_url ? (
              <img
                src={node.cover_url}
                alt={node.title}
                className="w-14 h-20 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-14 h-20 bg-warm-100 rounded-lg flex items-center justify-center text-2xl">
                📖
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-wood-800 text-sm leading-snug">
                {node.title}
              </h3>
              <p className="text-xs text-wood-500 mt-0.5">{node.author}</p>
              {node.rating && (
                <p className="text-xs text-warm-500 mt-1">
                  {renderStars(node.rating)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-wood-300 hover:text-wood-600 transition-colors text-lg leading-none ml-2"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-5 pt-3 space-y-4">
        {/* 감상문 */}
        <div>
          <h4 className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-2">
            감상문
          </h4>
          <div className="bg-cream rounded-xl p-3">
            <p className="text-sm text-wood-700 leading-relaxed">
              {node.content_preview}
            </p>
          </div>
          <p className="text-xs text-wood-400 mt-1.5">
            {new Date(node.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 연결된 감상문 */}
        {connections.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-2">
              유사한 감상 ({connections.length}개)
            </h4>
            <div className="space-y-2">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center gap-3 p-2.5 bg-warm-50 rounded-xl border border-warm-100"
                >
                  {conn.cover_url ? (
                    <img
                      src={conn.cover_url}
                      alt={conn.title}
                      className="w-8 h-11 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-11 bg-warm-100 rounded flex items-center justify-center text-sm">
                      📕
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-wood-800 truncate">
                      {conn.title}
                    </p>
                    <p className="text-xs text-wood-400">{conn.author}</p>
                  </div>
                  <span className="shrink-0 text-xs font-mono px-2 py-0.5 bg-warm-200 text-warm-800 rounded-full">
                    {(conn.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 같은 책의 다른 감상문 */}
        {otherReviews.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-2">
              같은 책의 다른 감상
            </h4>
            {otherReviews.map((r) => (
              <div
                key={r.id}
                className="p-2.5 bg-wood-50 rounded-xl text-xs text-wood-600 leading-relaxed"
              >
                {r.content.length > 80
                  ? r.content.slice(0, 80) + "…"
                  : r.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
