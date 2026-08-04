import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8008/api";

const LOGIN_PAGE_PATH = "/auth/login";

const api = axios.create({
  baseURL: "http://localhost:8008/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    if (response.status === 401) {
      ["userId", "userName", "role"].forEach((key) => {
        localStorage.removeItem(key);
      });

      const isLoginPage = window.location.pathname === LOGIN_PAGE_PATH;

      if (!isLoginPage) {
        window.location.replace(LOGIN_PAGE_PATH);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
