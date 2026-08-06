import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? `${BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.response?.data?.data?.message;

    if (message) {
      error.userMessage = message;
    }

    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data.data;

export default api;
