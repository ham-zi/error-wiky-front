import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function OAuthSuccessPage() {
  const { refresh } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    refresh()
      .then(() => nav("/error-wiki", { replace: true }))
      .catch(() => nav("/auth/login?oauthError=true", { replace: true }));
  }, [refresh, nav]);
  return (
    <div className="p-16 text-center">
      Google 로그인 정보를 확인하는 중입니다...
    </div>
  );
}
