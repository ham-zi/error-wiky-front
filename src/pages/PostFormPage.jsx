import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import api, { unwrap } from "../api";
import { categories } from "../constants/categories";

const empty = {
  boardType: "ERROR_WIKI",
  title: "",
  content: "",
  category: "ETC",
  errorMessage: "",
  environment: "",
  cause: "",
  solution: "",
};

export default function PostFormPage({ edit = false }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...empty,
    boardType: params.get("boardType") ?? "ERROR_WIKI",
  });

  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!edit) {
      return;
    }

    api
      .get(`/posts/${id}`)
      .then((response) => {
        const post = unwrap(response);

        setForm({
          ...empty,
          ...post,
          category: post.category ?? "ETC",
        });
      })
      .catch(() => {
        navigate("/error-wiki");
      });
  }, [edit, id, navigate]);

  const set = (key, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  async function recommend() {
    if (!form.errorMessage.trim()) {
      setMessage("오류 메시지를 먼저 입력하세요.");
      return;
    }

    setBusy(true);
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/ai/recommend", {
        errorMessage: form.errorMessage,
        cause: form.cause,
        solution: form.solution,
      });

      const result = unwrap(response);

      setForm((currentForm) => ({
        ...currentForm,
        title: result.title,
        category: result.category ?? "ETC",
      }));

      setMessage(result.notice ?? "Ollama 추천을 적용했습니다.");
    } catch (error) {
      setMessage(error.userMessage ?? "AI 추천에 실패했습니다.");
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const body = new FormData();

      body.append(
        "data",
        new Blob([JSON.stringify(form)], {
          type: "application/json",
        }),
      );

      files.forEach((file) => {
        body.append("files", file);
      });

      const response = edit
        ? await api.put(`/posts/${id}`, body)
        : await api.post("/posts", body);

      const result = unwrap(response);

      navigate(`/posts/${result.postId}`);
    } catch (error) {
      setMessage(error.userMessage ?? "게시글 저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const isErrorWiki = form.boardType === "ERROR_WIKI";

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-7">
        <p className="font-bold text-[#ff512f]">ERROR WIKY</p>

        <h1 className="mt-1 text-3xl font-black">
          {edit ? "게시글 수정" : "게시글 작성"}
        </h1>
      </div>

      <form onSubmit={submit} className="card space-y-6 p-6 sm:p-8">
        <div>
          <span className="label">게시판</span>

          <div className="flex gap-2">
            {["ERROR_WIKI", "FREE"].map((boardType) => (
              <button
                type="button"
                key={boardType}
                onClick={() => set("boardType", boardType)}
                className={
                  form.boardType === boardType ? "btn-primary" : "btn-secondary"
                }
              >
                {boardType === "ERROR_WIKI" ? "에러위키" : "자유게시판"}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="제목"
          value={form.title}
          onChange={(value) => set("title", value)}
          required
        />

        {isErrorWiki && (
          <>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label>
                <span className="label">카테고리</span>

                <select
                  className="input"
                  value={form.category}
                  onChange={(event) => set("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="btn-secondary self-end disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
                onClick={recommend}
              >
                {loading
                  ? "✨ AI 제목·분류 추천 중..."
                  : "✨ AI 제목·분류 추천"}
              </button>
            </div>

            <TextArea
              label="오류 메시지"
              value={form.errorMessage}
              onChange={(value) => set("errorMessage", value)}
              required
            />

            <TextArea
              label="발생 환경"
              value={form.environment}
              onChange={(value) => set("environment", value)}
            />

            <TextArea
              label="원인"
              value={form.cause}
              onChange={(value) => set("cause", value)}
              required
            />

            <TextArea
              label="해결 방법"
              value={form.solution}
              onChange={(value) => set("solution", value)}
              required
            />
          </>
        )}

        <TextArea
          label={isErrorWiki ? "추가 설명" : "내용"}
          value={form.content}
          onChange={(value) => set("content", value)}
          required
          rows={10}
        />

        <label>
          <span className="label">첨부파일 (최대 5개)</span>

          <input
            className="input"
            type="file"
            multiple
            accept=".txt,.log,.java,.js,.jsx,.ts,.tsx,.json,.yml,.yaml,.xml,.png,.jpg,.jpeg,.gif,.pdf,.zip"
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? []).slice(
                0,
                5,
              );

              setFiles(selectedFiles);
            }}
          />

          <p className="mt-2 text-xs text-[#667085]">
            선택: {files.map((file) => file.name).join(", ") || "없음"}
          </p>
        </label>

        {message && (
          <p
            className={
              message.includes("실패") || message.includes("못해")
                ? "text-sm text-red-600"
                : "text-sm text-[#667085]"
            }
          >
            {message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={busy}
            onClick={() => navigate(-1)}
          >
            취소
          </button>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && !loading ? "처리 중..." : edit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, required = false }) {
  return (
    <label>
      <span className="label">{label}</span>

      <input
        className="input"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = false,
  rows = 5,
  placeholder,
}) {
  return (
    <label>
      <span className="label">{label}</span>

      <textarea
        className="input"
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
