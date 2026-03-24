import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GraphPage from "./pages/GraphPage";
import BooksPage from "./pages/BooksPage";
import ReviewsPage from "./pages/ReviewsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<GraphPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
