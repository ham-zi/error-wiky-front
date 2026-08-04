import api from "./axios";

const LOGIN_API_PATH = import.meta.env.VITE_LOGIN_API_PATH ?? "/login";

export const login = async ({ userId, password }) => {
  const response = await api.post(LOGIN_API_PATH, {
    userId,
    password,
  });

  return response.data;
};
