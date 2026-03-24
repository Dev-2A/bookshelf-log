import { useState, useEffect } from "react";
import { getBooks, getReviews, createReview, deleteReview } from "../api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewsRes, booksRes] = await Promise.all([
        getReviews(),
        getBooks(),
      ]);
      setReviews(reviewsRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !content.trim()) {
      alert("도서와 감상문 내용을 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        book_id: Number(selectedBookId),
        content: content.trim(),
        rating,
      });
      alert("감상문이 등록되었습니다!");
      setSelectedBookId("");
      setContent("");
      setRating(5);
      loadData();
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("이 감상문을 삭제하시겠습니까?")) return;
    try {
      await deleteReview(id);
      loadData();
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-wood-800">✍️ 독서 감상문</h1>

      {/* 감상문 작성 폼 */}
      <section className="bg-white bg-opacity-70 rounded-2xl p-6 border border-wood-200 shadow-sm">
        <h2 className="text-lg font-semibold text-wood-700 mb-4">
          새 감상문 작성
        </h2>

        {books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📚</p>
            <p className="text-wood-400">먼저 서재에 책을 추가해주세요.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 도서 선택 */}
            <div>
              <label className="block text-sm font-medium text-wood-600 mb-1.5">
                어떤 책을 읽으셨나요?
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent transition"
              >
                <option value="">-- 도서를 선택하세요 --</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.author}
                  </option>
                ))}
              </select>
            </div>

            {/* 평점 */}
            <div>
              <label className="block text-sm font-medium text-wood-600 mb-1.5">
                평점
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xl tracking-wider text-warm-500">
                  {renderStars(rating)}
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="flex-1 accent-warm-500"
                />
                <span className="text-sm text-wood-500 w-8 text-center">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* 감상문 내용 */}
            <div>
              <label className="block text-sm font-medium text-wood-600 mb-1.5">
                감상문
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                placeholder="이 책을 읽고 느낀 점을 자유롭게 적어주세요.&#10;작성된 감상문은 BGE-M3 임베딩으로 벡터화되어 유사한 감상끼리 연결됩니다."
                className="w-full px-4 py-3 bg-cream border border-wood-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent placeholder-wood-300 transition leading-relaxed"
                maxLength={5000}
              />
              <p className="text-xs text-wood-400 mt-1 text-right">
                {content.length} / 5,000자
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-wood-600 text-cream rounded-xl hover:bg-wood-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "임베딩 생성 중..." : "감상문 등록"}
            </button>
          </form>
        )}
      </section>

      {/* 감상문 목록 */}
      <section className="bg-white bg-opacity-70 rounded-2xl p-6 border border-wood-200 shadow-sm">
        <h2 className="text-lg font-semibold text-wood-700 mb-4">
          감상 기록{" "}
          <span className="text-warm-500 font-bold">{reviews.length}</span>개
        </h2>
        {loading ? (
          <p className="text-wood-400">불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🍂</p>
            <p className="text-wood-400">
              아직 작성된 감상문이 없어요. 첫 감상을 기록해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-wood-50 border border-wood-100 rounded-xl hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.book_cover_url ? (
                      <img
                        src={review.book_cover_url}
                        alt={review.book_title}
                        className="w-10 h-14 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-warm-100 rounded-lg flex items-center justify-center">
                        📖
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-wood-800">
                        {review.book_title}
                      </p>
                      <p className="text-sm text-wood-500">
                        {review.book_author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {review.has_embedding && (
                      <span className="text-xs px-2.5 py-1 bg-warm-100 text-warm-700 rounded-full">
                        🔗 임베딩 완료
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-sm text-wood-300 hover:text-red-400 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {review.rating && (
                  <p className="text-sm text-warm-500 mb-2">
                    {renderStars(review.rating)}
                  </p>
                )}
                <p className="text-sm text-wood-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
                <p className="text-xs text-wood-400 mt-3">
                  {new Date(review.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
