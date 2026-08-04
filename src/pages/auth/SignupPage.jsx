import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/userApi";

const INITIAL_FORM = {
  loginId: "",
  name: "",
  password: "",
  passwordConfirm: "",
};

const INITIAL_ERRORS = {
  loginId: "",
  name: "",
  password: "",
  passwordConfirm: "",
  submit: "",
};

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const nextErrors = {
      ...INITIAL_ERRORS,
    };

    const trimmedLoginId = form.loginId.trim();
    const trimmedName = form.name.trim();

    if (!trimmedLoginId) {
      nextErrors.loginId = "아이디를 입력해 주세요.";
    } else if (trimmedLoginId.length < 4 || trimmedLoginId.length > 20) {
      nextErrors.loginId = "아이디는 4자 이상 20자 이하로 입력해 주세요.";
    }

    if (!trimmedName) {
      nextErrors.name = "이름을 입력해 주세요.";
    } else if (trimmedName.length < 2 || trimmedName.length > 20) {
      nextErrors.name = "이름은 2자 이상 20자 이하로 입력해 주세요.";
    }

    if (!form.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (form.password.length < 8 || form.password.length > 30) {
      nextErrors.password = "비밀번호는 8자 이상 30자 이하로 입력해 주세요.";
    }

    if (!form.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호를 다시 입력해 주세요.";
    } else if (form.password !== form.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      submit: "",
    }));

    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSuccessMessage("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signup({
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
      });

      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
      setSuccessMessage(response?.message ?? "회원가입이 완료되었습니다.");
    } catch (error) {
      const { response } = error;

      if (!response) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          submit: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        }));
        return;
      }

      const responseMessage =
        response.data?.message ?? "회원가입에 실패했습니다.";

      if (response.status === 400) {
        const fieldErrors = response.data?.data;

        if (
          fieldErrors &&
          typeof fieldErrors === "object" &&
          !Array.isArray(fieldErrors)
        ) {
          setErrors((previousErrors) => ({
            ...previousErrors,
            loginId:
              typeof fieldErrors.loginId === "string"
                ? fieldErrors.loginId
                : previousErrors.loginId,
            name:
              typeof fieldErrors.name === "string"
                ? fieldErrors.name
                : previousErrors.name,
            password:
              typeof fieldErrors.password === "string"
                ? fieldErrors.password
                : previousErrors.password,
            submit: responseMessage,
          }));
        } else {
          setErrors((previousErrors) => ({
            ...previousErrors,
            submit: responseMessage,
          }));
        }

        return;
      }

      if (response.status === 409) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          loginId: responseMessage,
          submit: "",
        }));

        return;
      }

      setErrors((previousErrors) => ({
        ...previousErrors,
        submit: responseMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px] bg-white px-8 py-12 shadow-sm sm:px-12">
        <h1 className="mb-10 text-2xl font-bold text-[#101828]">회원가입</h1>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField
            id="loginId"
            name="loginId"
            label="아이디"
            type="text"
            value={form.loginId}
            placeholder="아이디를 입력해 주세요"
            error={errors.loginId}
            onChange={handleChange}
            autoComplete="username"
            maxLength={20}
          />

          <FormField
            id="name"
            name="name"
            label="이름"
            type="text"
            value={form.name}
            placeholder="이름을 입력해 주세요"
            error={errors.name}
            onChange={handleChange}
            autoComplete="name"
            maxLength={20}
          />

          <FormField
            id="password"
            name="password"
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="비밀번호를 입력해 주세요"
            error={errors.password}
            onChange={handleChange}
            autoComplete="new-password"
            maxLength={30}
          />

          <FormField
            id="passwordConfirm"
            name="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            placeholder="비밀번호를 다시 입력해 주세요"
            error={errors.passwordConfirm}
            onChange={handleChange}
            autoComplete="new-password"
            maxLength={30}
          />

          {errors.submit && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              <p>{successMessage}</p>

              <button
                type="button"
                className="mt-2 font-semibold underline underline-offset-2"
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-md bg-[#ff512f] text-sm font-semibold text-white transition hover:bg-[#ed4324] disabled:cursor-not-allowed disabled:bg-[#ff9a86]"
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </button>

          <p className="text-center text-sm text-[#667085]">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#ff512f] hover:underline"
            >
              로그인
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

function FormField({
  id,
  name,
  label,
  type,
  value,
  placeholder,
  error,
  onChange,
  autoComplete,
  maxLength,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[#344054]"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={[
          "h-12 w-full rounded-md border bg-white px-4 text-sm text-[#101828]",
          "outline-none transition placeholder:text-[#98a2b3]",
          "focus:border-[#ff512f] focus:ring-2 focus:ring-[#ff512f]/15",
          error ? "border-red-400" : "border-[#d0d5dd]",
        ].join(" ")}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default SignupPage;
