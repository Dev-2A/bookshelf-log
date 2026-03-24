export default function NodeDetail({ node, onClose }) {
  if (!node) return null;

  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

  return (
    <div className="bg-white bg-opacity-95 rounded-2xl border border-wood-200 shadow-lg p-5 w-80">
      {/* 닫기 버튼 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {node.cover_url ? (
            <img
              src={node.cover_url}
              alt={node.title}
              className="w-12 h-16 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="w-12 h-16 bg-warm-100 rounded-lg flex items-center justify-center text-xl">
              📖
            </div>
          )}
          <div>
            <h3 className="font-bold text-wood-800 text-sm leading-snug">
              {node.title}
            </h3>
            <p className="text-xs text-wood-500">{node.author}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-wood-300 hover:text-wood-600 transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* 평점 */}
      {node.rating && (
        <p className="text-sm text-warm-500 mb-2">{renderStars(node.rating)}</p>
      )}

      {/* 감상문 미리보기 */}
      <div className="bg-cream rounded-xl p-3 mb-3">
        <p className="text-sm text-wood-700 leading-relaxed">
          {node.content_preview}
        </p>
      </div>

      {/* 작성일 */}
      <p className="text-xs text-wood-400">
        {new Date(node.created_at).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
