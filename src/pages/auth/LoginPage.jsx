import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";

function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.42l-3.24-2.53c-.9.6-2.05.96-3.4.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.88A6.02 6.02 0 0 1 6.09 12c0-.65.11-1.29.31-1.88V7.51H3.06A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.49l3.34-2.61Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.94 5.51l3.34 2.61C7.19 7.75 9.4 5.99 12 5.99Z"
      />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    userId: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRedirectPath = () => {
    const previousPath = location.state?.from;

    if (typeof previousPath === "string") {
      return previousPath;
    }

    if (previousPath?.pathname) {
      return previousPath.pathname;
    }

    return "/";
  };

  const validateForm = () => {
    const errors = {};

    if (!form.userId.trim()) {
      errors.userId = "아이디를 입력해 주세요.";
    }

    if (!form.password) {
      errors.password = "비밀번호를 입력해 주세요.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setRequestError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      const response = await login({
        userId: form.userId.trim(),
        password: form.password,
      });

      if (Number(response?.code) !== 200) {
        setRequestError(response?.message ?? "로그인에 실패했습니다.");
        return;
      }

      navigate(getRedirectPath(), {
        replace: true,
      });
    } catch (error) {
      const status = error.response?.status;
      const responseMessage = error.response?.data?.message;

      if (status === 401) {
        setRequestError(
          responseMessage ?? "아이디 또는 비밀번호가 올바르지 않습니다.",
        );
        return;
      }

      if (status === 400) {
        setRequestError(
          responseMessage ?? "입력한 로그인 정보를 확인해 주세요.",
        );
        return;
      }

      if (!error.response) {
        setRequestError(
          "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      setRequestError(responseMessage ?? "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f2f2] px-5 py-10">
      <section className="w-full max-w-[352px] bg-white px-12 pb-8 pt-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-[480px]:px-7">
        <h1 className="mb-11 text-[20px] font-semibold text-[#202124]">
          로그인
        </h1>

        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="userId" className="sr-only">
              사용자 아이디
            </label>

            <input
              id="userId"
              name="userId"
              type="text"
              value={form.userId}
              onChange={handleChange}
              placeholder="UserID"
              autoComplete="username"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.userId)}
              aria-describedby={fieldErrors.userId ? "userId-error" : undefined}
              className={`h-[42px] w-full rounded-md border bg-white px-5 text-[11px] text-[#333333] outline-none transition placeholder:text-[#666666] disabled:cursor-not-allowed disabled:bg-gray-50 ${
                fieldErrors.userId
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-[#e5e5e5] focus:border-[#ff5a2a] focus:ring-1 focus:ring-[#ff5a2a]"
              }`}
            />

            {fieldErrors.userId && (
              <p id="userId-error" className="mt-1.5 text-[11px] text-red-500">
                {fieldErrors.userId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className={`h-[42px] w-full rounded-md border bg-white px-5 text-[11px] text-[#333333] outline-none transition placeholder:text-[#666666] disabled:cursor-not-allowed disabled:bg-gray-50 ${
                fieldErrors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-[#e5e5e5] focus:border-[#ff5a2a] focus:ring-1 focus:ring-[#ff5a2a]"
              }`}
            />

            {fieldErrors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-[11px] text-red-500"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          {requestError && (
            <div
              role="alert"
              className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[11px] leading-5 text-red-600"
            >
              {requestError}
            </div>
          )}

          <div className="my-7 flex items-center gap-3">
            <span className="text-[11px] whitespace-nowrap text-[#666666]">
              Or continue with
            </span>

            <div className="h-px flex-1 bg-[#eeeeee]" />
          </div>

          <button
            type="button"
            disabled
            title="Google 로그인 API가 제공되지 않았습니다."
            aria-label="Google 로그인 준비 중"
            className="mx-auto flex h-[40px] w-[78px] cursor-not-allowed items-center justify-center rounded-sm bg-[#f8f8f8] opacity-80"
          >
            <GoogleLogo />
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 h-[38px] w-full rounded-md bg-[#ff572c] text-[11px] font-medium text-white transition hover:bg-[#ee4d22] focus:outline-none focus:ring-2 focus:ring-[#ff572c] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
