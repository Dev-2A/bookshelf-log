import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "📊 그래프", shortLabel: "📊" },
  { path: "/books", label: "📚 서재", shortLabel: "📚" },
  { path: "/reviews", label: "✍️ 감상문", shortLabel: "✍️" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-wood-50 border-b border-wood-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg sm:text-xl font-bold text-wood-800 tracking-tight"
          >
            📖 BookShelf.log
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-wood-700 text-cream shadow-sm"
                    : "text-wood-600 hover:bg-wood-100 hover:text-wood-800"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="text-center py-6 text-sm text-wood-400 border-t border-wood-100">
        읽은 책은 별이 되어 서로를 비춥니다 ✨
      </footer>
    </div>
  );
}
