import api from "./axios";

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
