import axios from "axios";
export const BACKEND_URL=import.meta.env.VITE_BACKEND_URL??"http://localhost:8008";
const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL??`${BACKEND_URL}/api`,withCredentials:true,timeout:15000});
api.interceptors.response.use(r=>r,e=>{const message=e.response?.data?.message??e.response?.data?.message??e.response?.data?.data?.message;if(message)e.userMessage=message;return Promise.reject(e)});
export const unwrap=r=>r.data.data;
export default api;
