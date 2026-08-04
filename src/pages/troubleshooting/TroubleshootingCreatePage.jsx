import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recommendTroubleshootingMetadata } from "../../api/troubleshootingApi";
import {
  EMPTY_TROUBLESHOOTING_FORM,
  TROUBLESHOOTING_CATEGORY_OPTIONS,
  TROUBLESHOOTING_FIELD_LIMITS,
  isSupportedTroubleshootingCategory,
} from "../../constants/troubleshooting";

const EMPTY_ERRORS = {
  title: "",
  category: "",
  problemSituation: "",
  errorMessage: "",
  cause: "",
  solution: "",
  submit: "",
};

function TroubleshootingForm({
  mode,
  initialValues = EMPTY_TROUBLESHOOTING_FORM,
  onSubmit,
  cancelTo,
}) {
  const isEditMode = mode === "edit";

  const [form, setForm] = useState(() => normalizeFormValues(initialValues));

  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

  const [recommendationStatus, setRecommendationStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    setForm(normalizeFormValues(initialValues));
    setErrors(EMPTY_ERRORS);
    setRecommendationStatus({
      type: "",
      message: "",
    });
  }, [initialValues]);

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

    setRecommendationStatus({
      type: "",
      message: "",
    });
  };

  const handleRecommend = async () => {
    if (isRecommending || isSubmitting) {
      return;
    }

    const recommendationErrors = validateRecommendationSource(form);

    if (Object.keys(recommendationErrors).length > 0) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        ...recommendationErrors,
      }));

      setRecommendationStatus({
        type: "error",
        message: "문제 상황, 원인과 해결 방법을 먼저 작성해 주세요.",
      });

      return;
    }

    setIsRecommending(true);
    setRecommendationStatus({
      type: "",
      message: "",
    });

    try {
      const response = await recommendTroubleshootingMetadata({
        problemSituation: form.problemSituation.trim(),
        errorMessage: form.errorMessage.trim(),
        cause: form.cause.trim(),
        solution: form.solution.trim(),
      });

      const recommendedTitle =
        typeof response?.data?.title === "string"
          ? response.data.title.trim()
          : "";

      const recommendedCategory =
        typeof response?.data?.category === "string"
          ? response.data.category.trim()
          : "";

      if (!recommendedTitle || !recommendedCategory) {
        throw createClientError("추천 API 응답 형식이 올바르지 않습니다.");
      }

      if (!isSupportedTroubleshootingCategory(recommendedCategory)) {
        throw createClientError(
          `추천된 분류 '${recommendedCategory}'가 현재 지원 목록에 없습니다. 백엔드 카테고리 Enum을 확인해 주세요.`,
        );
      }

      setForm((previousForm) => ({
        ...previousForm,
        title: recommendedTitle.slice(0, TROUBLESHOOTING_FIELD_LIMITS.title),
        category: recommendedCategory,
      }));

      setErrors((previousErrors) => ({
        ...previousErrors,
        title: "",
        category: "",
      }));

      setRecommendationStatus({
        type: "success",
        message:
          "Ollama가 제목과 분류를 추천했습니다. 내용을 검토한 뒤 저장해 주세요.",
      });
    } catch (error) {
      const serverFieldErrors = getServerFieldErrors(error);

      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          ...serverFieldErrors,
        }));
      }

      setRecommendationStatus({
        type: "error",
        message: getRequestErrorMessage(
          error,
          "제목과 분류를 추천받지 못했습니다.",
        ),
      });
    } finally {
      setIsRecommending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || isRecommending) {
      return;
    }

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        ...EMPTY_ERRORS,
        ...validationErrors,
      });

      return;
    }

    setIsSubmitting(true);
    setErrors(EMPTY_ERRORS);

    try {
      await onSubmit(createRequestData(form));
    } catch (error) {
      const serverFieldErrors = getServerFieldErrors(error);

      setErrors({
        ...EMPTY_ERRORS,
        ...serverFieldErrors,
        submit: getRequestErrorMessage(
          error,
          isEditMode
            ? "트러블슈팅을 수정하지 못했습니다."
            : "트러블슈팅을 등록하지 못했습니다.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <FormSection
        title="오류 내용"
        description="발생한 문제와 해결 과정을 구체적으로 작성해 주세요."
      >
        <TextareaField
          id="problemSituation"
          name="problemSituation"
          label="문제 상황"
          required
          value={form.problemSituation}
          error={errors.problemSituation}
          onChange={handleChange}
          maxLength={TROUBLESHOOTING_FIELD_LIMITS.problemSituation}
          rows={7}
          placeholder="어떤 기능을 구현하던 중 어떤 문제가 발생했는지 작성해 주세요."
        />

        <TextareaField
          id="errorMessage"
          name="errorMessage"
          label="오류 메시지"
          value={form.errorMessage}
          error={errors.errorMessage}
          onChange={handleChange}
          maxLength={TROUBLESHOOTING_FIELD_LIMITS.errorMessage}
          rows={6}
          placeholder="발생한 오류 메시지나 로그를 입력해 주세요. 오류 메시지가 없다면 비워둘 수 있습니다."
          monospace
        />

        <TextareaField
          id="cause"
          name="cause"
          label="원인"
          required
          value={form.cause}
          error={errors.cause}
          onChange={handleChange}
          maxLength={TROUBLESHOOTING_FIELD_LIMITS.cause}
          rows={6}
          placeholder="문제가 발생한 원인을 작성해 주세요."
        />

        <TextareaField
          id="solution"
          name="solution"
          label="해결 방법"
          required
          value={form.solution}
          error={errors.solution}
          onChange={handleChange}
          maxLength={TROUBLESHOOTING_FIELD_LIMITS.solution}
          rows={9}
          placeholder="문제를 해결한 과정과 최종 해결 방법을 작성해 주세요."
        />
      </FormSection>

      <FormSection
        title="제목 및 분류"
        description="직접 입력하거나 작성한 내용을 바탕으로 Ollama 추천을 받을 수 있습니다."
      >
        <div className="rounded-xl border border-[#ffd1c7] bg-[#fff8f6] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-[#101828]">Ollama AI 추천</p>

              <p className="mt-1 text-sm leading-6 text-[#667085]">
                문제 상황, 오류 메시지, 원인과 해결 방법을 분석해 제목과 분류를
                추천합니다.
              </p>
            </div>

            <button
              type="button"
              disabled={isRecommending || isSubmitting}
              onClick={handleRecommend}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-[#ff512f] bg-white px-5 text-sm font-semibold text-[#ff512f] transition hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:border-[#ffb4a5] disabled:text-[#ff9a86]"
            >
              {isRecommending ? "Ollama 추천 중..." : "제목·분류 추천받기"}
            </button>
          </div>

          {recommendationStatus.message && (
            <p
              role={recommendationStatus.type === "error" ? "alert" : "status"}
              className={[
                "mt-4 rounded-lg px-4 py-3 text-sm",
                recommendationStatus.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-600",
              ].join(" ")}
            >
              {recommendationStatus.message}
            </p>
          )}
        </div>

        <TextInputField
          id="title"
          name="title"
          label="제목"
          required
          value={form.title}
          error={errors.title}
          onChange={handleChange}
          maxLength={TROUBLESHOOTING_FIELD_LIMITS.title}
          placeholder="트러블슈팅 제목을 입력해 주세요."
        />

        <SelectField
          id="category"
          name="category"
          label="분류"
          required
          value={form.category}
          error={errors.category}
          onChange={handleChange}
          options={TROUBLESHOOTING_CATEGORY_OPTIONS}
        />
      </FormSection>

      {errors.submit && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {errors.submit}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#e4e7ec] pt-7 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[#d0d5dd] bg-white px-7 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          취소
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isRecommending}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[#ff512f] px-8 text-sm font-semibold text-white transition hover:bg-[#ed4324] disabled:cursor-not-allowed disabled:bg-[#ff9a86]"
        >
          {isSubmitting
            ? isEditMode
              ? "수정 중..."
              : "등록 중..."
            : isEditMode
              ? "수정 완료"
              : "등록하기"}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <h2 className="text-xl font-bold text-[#101828]">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
      </div>

      <div className="space-y-6">{children}</div>
    </section>
  );
}

function TextInputField({
  id,
  name,
  label,
  required,
  value,
  error,
  onChange,
  maxLength,
  placeholder,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />

      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={getFieldClassName(error)}
      />

      <FieldFooter
        id={errorId}
        error={error}
        currentLength={value.length}
        maxLength={maxLength}
      />
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  required,
  value,
  error,
  onChange,
  options,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={getFieldClassName(error)}
      >
        <option value="">분류를 선택해 주세요.</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function TextareaField({
  id,
  name,
  label,
  required,
  value,
  error,
  onChange,
  maxLength,
  rows,
  placeholder,
  monospace = false,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={[
          getFieldClassName(error),
          "min-h-[120px] resize-y py-3 leading-6",
          monospace ? "font-mono" : "",
        ].join(" ")}
      />

      <FieldFooter
        id={errorId}
        error={error}
        currentLength={value.length}
        maxLength={maxLength}
      />
    </div>
  );
}

function FieldLabel({ htmlFor, label, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-[#344054]"
    >
      {label}

      {required && (
        <span aria-hidden="true" className="ml-1 text-[#ff512f]">
          *
        </span>
      )}
    </label>
  );
}

function FieldFooter({ id, error, currentLength, maxLength }) {
  return (
    <div className="mt-2 flex min-h-5 items-start justify-between gap-4">
      <div>
        {error && (
          <p id={id} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>

      <span className="shrink-0 text-xs text-[#98a2b3]">
        {currentLength.toLocaleString()} / {maxLength.toLocaleString()}
      </span>
    </div>
  );
}

function getFieldClassName(error) {
  return [
    "w-full rounded-lg border bg-white px-4 text-sm text-[#101828]",
    "outline-none transition placeholder:text-[#98a2b3]",
    "focus:border-[#ff512f] focus:ring-2 focus:ring-[#ff512f]/15",
    error ? "border-red-400" : "border-[#d0d5dd]",
    "h-12",
  ].join(" ");
}

function normalizeFormValues(values) {
  return {
    title: values?.title ?? "",
    category: values?.category ?? "",
    problemSituation: values?.problemSituation ?? "",
    errorMessage: values?.errorMessage ?? "",
    cause: values?.cause ?? "",
    solution: values?.solution ?? "",
  };
}

function createRequestData(form) {
  return {
    title: form.title.trim(),
    category: form.category,
    problemSituation: form.problemSituation.trim(),
    errorMessage: form.errorMessage.trim(),
    cause: form.cause.trim(),
    solution: form.solution.trim(),
  };
}

function validateForm(form) {
  const errors = {};

  const title = form.title.trim();
  const problemSituation = form.problemSituation.trim();
  const errorMessage = form.errorMessage.trim();
  const cause = form.cause.trim();
  const solution = form.solution.trim();

  if (!title) {
    errors.title = "제목을 입력해 주세요.";
  } else if (title.length < 2 || title.length > 100) {
    errors.title = "제목은 2자 이상 100자 이하로 입력해 주세요.";
  }

  if (!form.category) {
    errors.category = "분류를 선택해 주세요.";
  } else if (!isSupportedTroubleshootingCategory(form.category)) {
    errors.category = "지원하지 않는 분류입니다.";
  }

  if (!problemSituation) {
    errors.problemSituation = "문제 상황을 입력해 주세요.";
  } else if (problemSituation.length > 2000) {
    errors.problemSituation = "문제 상황은 2,000자 이하로 입력해 주세요.";
  }

  if (errorMessage.length > 2000) {
    errors.errorMessage = "오류 메시지는 2,000자 이하로 입력해 주세요.";
  }

  if (!cause) {
    errors.cause = "원인을 입력해 주세요.";
  } else if (cause.length > 2000) {
    errors.cause = "원인은 2,000자 이하로 입력해 주세요.";
  }

  if (!solution) {
    errors.solution = "해결 방법을 입력해 주세요.";
  } else if (solution.length > 4000) {
    errors.solution = "해결 방법은 4,000자 이하로 입력해 주세요.";
  }

  return errors;
}

function validateRecommendationSource(form) {
  const errors = {};

  if (!form.problemSituation.trim()) {
    errors.problemSituation = "추천을 받으려면 문제 상황을 입력해 주세요.";
  }

  if (!form.cause.trim()) {
    errors.cause = "추천을 받으려면 원인을 입력해 주세요.";
  }

  if (!form.solution.trim()) {
    errors.solution = "추천을 받으려면 해결 방법을 입력해 주세요.";
  }

  return errors;
}

function getServerFieldErrors(error) {
  if (
    error.response?.status !== 400 ||
    !error.response.data?.data ||
    typeof error.response.data.data !== "object" ||
    Array.isArray(error.response.data.data)
  ) {
    return {};
  }

  const serverData = error.response.data.data;
  const allowedFields = Object.keys(EMPTY_TROUBLESHOOTING_FORM);

  return allowedFields.reduce((fieldErrors, fieldName) => {
    if (typeof serverData[fieldName] === "string") {
      fieldErrors[fieldName] = serverData[fieldName];
    }

    return fieldErrors;
  }, {});
}

function getRequestErrorMessage(error, fallbackMessage) {
  if (error?.userMessage) {
    return error.userMessage;
  }

  if (error?.isAxiosError && !error.response) {
    return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.response?.status === 403) {
    return "이 트러블슈팅을 수정할 권한이 없습니다.";
  }

  if (error.response?.status === 404) {
    return "트러블슈팅을 찾을 수 없습니다.";
  }

  return error.response?.data?.message ?? error.message ?? fallbackMessage;
}

function createClientError(message) {
  const error = new Error(message);
  error.userMessage = message;
  return error;
}

export default TroubleshootingForm;
