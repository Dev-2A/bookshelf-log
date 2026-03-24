import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// -- 도서 --
export const searchBooks = (query) =>
  api.get("/books/search", { params: { q: query } });

export const getBooks = () => api.get("/books/");

export const getBook = (id) => api.get(`/books/${id}`);

export const createBook = (data) => api.post("/books/", data);

export const deleteBook = (id) => api.delete(`/books/${id}`);

// -- 감상문 --
export const getReviews = () => api.get("/reviews/");

export const getReview = (id) => api.get(`/reviews/${id}`);

export const getReviewsByBook = (bookId) => api.get(`/reviews/book/${bookId}`);

export const createReview = (data) => api.post("/review/", data);

export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);

export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// -- 그래프 --
export const getGraphData = (threshold = 0.5) =>
  api.get("/graph/", { params: { threshold } });

export const getGraphStats = (threshold = 0.5) =>
  api.get("/graph/stats", { params: { threshold } });

export default api;
