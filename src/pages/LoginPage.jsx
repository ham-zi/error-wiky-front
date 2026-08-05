import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "../api";
import { useAuth } from "../auth/AuthContext";
import api, { unwrap } from "../api";
export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [error, setError] = useState(
    params.get("oauthError") ? "Google 로그인에 실패했습니다." : "",
  );
  const [google, setGoogle] = useState(false);
  useEffect(() => {
    if (user) nav("/error-wiki", { replace: true });
  }, [user, nav]);
  useEffect(() => {
    api
      .get("/auth/config")
      .then((r) => setGoogle(unwrap(r).googleEnabled))
      .catch(() => {});
  }, []);
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      nav("/error-wiki");
    } catch (err) {
      setError(err.userMessage ?? "아이디 또는 비밀번호를 확인해 주세요.");
    }
  }
  return (
    <AuthCard title="로그인">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="아이디"
          value={form.loginId}
          onChange={(v) => setForm({ ...form, loginId: v })}
        />
        <Field
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          로그인
        </button>
      </form>
      <button
        disabled={!google}
        onClick={() =>
          (location.href = `${BACKEND_URL}/oauth2/authorization/google`)
        }
        className="btn-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        Google로 로그인{!google && " (환경변수 설정 필요)"}
      </button>
      <p className="mt-6 text-center text-sm text-[#667085]">
        계정이 없나요?{" "}
        <Link className="font-bold text-[#ff512f]" to="/auth/signup">
          회원가입
        </Link>
      </p>
    </AuthCard>
  );
}
export function AuthCard({ title, children }) {
  return (
    <section className="mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="mb-7 text-center text-3xl font-black">{title}</h1>
        {children}
      </div>
    </section>
  );
}
export function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="input"
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
