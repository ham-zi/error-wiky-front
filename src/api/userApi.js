import api from "./axios";

const API_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ?? "http://localhost:8008";

/**
 * 새로운 회원을 생성한다.
 *
 * @param {{
 *   loginId: string;
 *   password: string;
 *   name: string;
 * }} signupData
 */
export const signup = async (signupData) => {
  const response = await api.post("/users", signupData);
  return response.data;
};

/**
 * 구글 OAuth2 로그인 페이지로 이동한다.
 *
 * OAuth2 로그인은 Axios 요청이 아니라 브라우저 전체 이동으로 처리한다.
 * 로그인 완료 후 백엔드가 프론트 콜백 페이지로 리다이렉트한다.
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_SERVER_URL}/oauth2/authorization/google`;
};
