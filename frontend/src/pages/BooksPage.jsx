import { useState, useEffect } from "react";
import { searchBooks, createBook, getBooks, deleteBook } from "../api";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await getBooks();
      setBooks(res.data);
    } catch (err) {
      console.error("도서 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await searchBooks(query);
      setSearchResults(res.data);
    } catch (err) {
      alert("검색 실패: " + (err.response?.data?.detail || err.message));
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async (bookData) => {
    try {
      await createBook(bookData);
      alert("도서가 등록되었습니다!");
      setSearchResults([]);
      setQuery("");
      loadBooks();
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm("이 도서를 삭제하시겠습니까? 연결된 감상문도 함께 삭제됩니다.")
    )
      return;
    try {
      await deleteBook(id);
      loadBooks();
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-wood-800">📚 나의 서재</h1>

      {/* 알라딘 검색 */}
      <section className="bg-white bg-opacity-70 rounded-2xl p-6 border border-wood-200 shadow-sm">
        <h2 className="text-lg font-semibold text-wood-700 mb-4">
          도서 검색
          <span className="text-sm font-normal text-wood-400 ml-2">
            알라딘 Open API
          </span>
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목이나 저자를 입력해보세요"
            className="flex-1 px-4 py-2.5 bg-cream border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent placeholder-wood-300 transition"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 bg-wood-600 text-cream rounded-xl hover:bg-wood-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {searching ? "검색 중..." : "검색"}
          </button>
        </form>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-wood-500">
              검색 결과 ({searchResults.length}건)
            </h3>
            {searchResults.map((book, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-warm-50 border border-warm-200 rounded-xl hover:border-warm-300 transition"
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-20 bg-warm-100 rounded-lg flex items-center justify-center text-xl">
                    📕
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-wood-800 truncate">
                    {book.title}
                  </p>
                  <p className="text-sm text-wood-500">
                    {book.author} · {book.publisher}
                  </p>
                </div>
                <button
                  onClick={() => handleRegister(book)}
                  className="shrink-0 px-4 py-2 text-sm bg-warm-500 text-white rounded-xl hover:bg-warm-600 transition-colors shadow-sm"
                >
                  서재에 추가
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 등록된 도서 목록 */}
      <section className="bg-white bg-opacity-70 rounded-2xl p-6 border border-wood-200 shadow-sm">
        <h2 className="text-lg font-semibold text-wood-700 mb-4">
          내 책장{" "}
          <span className="text-warm-500 font-bold">{books.length}</span>권
        </h2>
        {loading ? (
          <p className="text-wood-400">불러오는 중...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🪴</p>
            <p className="text-wood-400">
              아직 서재가 비어 있어요. 위에서 책을 검색해 추가해보세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 p-4 bg-wood-50 border border-wood-100 rounded-xl hover:shadow-sm transition"
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-12 h-18 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-18 bg-warm-100 rounded-lg flex items-center justify-center text-xl">
                    📖
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-wood-800 truncate">
                    {book.title}
                  </p>
                  <p className="text-sm text-wood-500">{book.author}</p>
                </div>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="shrink-0 text-sm text-wood-300 hover:text-red-400 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
