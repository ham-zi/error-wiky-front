import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function OAuth2SuccessPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        const user = response.data?.data ?? response.data;

        if (user) {
          localStorage.setItem("userId", String(user.userId ?? ""));
          localStorage.setItem("userName", user.name ?? user.userName ?? "");
          localStorage.setItem("role", user.role ?? "");
        }

        navigate("/", {
          replace: true,
        });
      } catch {
        setErrorMessage(
          "로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요.",
        );
      }
    };

    loadCurrentUser();
  }, [navigate]);

  if (errorMessage) {
    return (
      <section className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-red-500">{errorMessage}</p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 rounded-md bg-[#ff512f] px-5 py-2.5 text-sm font-semibold text-white"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-150px)] items-center justify-center">
      <p className="text-sm text-[#667085]">
        Google 로그인 정보를 확인하고 있습니다...
      </p>
    </section>
  );
}

export default OAuth2SuccessPage;
