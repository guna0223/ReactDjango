import axios from "axios";

// Create axios instance with base URL pointing to Django backend
// Using relative path to leverage Vite proxy and avoid CORS issues
const api = axios.create({
  baseURL: "/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      // For session-based auth, we don't need to add tokens
      // Django session auth uses cookies automatically
    }
    console.log(`[API ${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("[API Response Error]", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("[API No Response]", error.request);
      return Promise.reject({ message: "No response from server" });
    } else {
      // Something else went wrong
      console.error("[API Error]", error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

// API methods for Book CRUD operations
export const bookAPI = {
  // GET all books
  getAllBooks: async () => {
    const response = await api.get("books/");
    return response.data;
  },

  // GET single book by ID
  getBookById: async (id) => {
    const response = await api.get(`books/${id}/`);
    return response.data;
  },

  // POST create new book
  createBook: async (bookData) => {
    const response = await api.post("books/", bookData);
    return response.data;
  },

  // PUT update entire book
  updateBook: async (id, bookData) => {
    const response = await api.put(`books/${id}/`, bookData);
    return response.data;
  },

  // PATCH partial update
  patchBook: async (id, bookData) => {
    const response = await api.patch(`books/${id}/`, bookData);
    return response.data;
  },

  // DELETE book
  deleteBook: async (id) => {
    const response = await api.delete(`books/${id}/`);
    return response.data;
  },
};

// API methods for Authentication
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("auth/register/", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("auth/login/", credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post("auth/logout/");
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("auth/me/");
    return response.data;
  },
};

export default api;
