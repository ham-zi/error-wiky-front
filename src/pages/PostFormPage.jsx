import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { unwrap } from "../api";
const categories = [
  "JAVA",
  "SPRING",
  "DATABASE",
  "REACT",
  "NETWORK",
  "DEPLOYMENT",
  "GIT",
  "ETC",
];
const empty = {
  boardType: "ERROR_WIKI",
  title: "",
  content: "",
  category: "SPRING",
  errorMessage: "",
  environment: "",
  cause: "",
  solution: "",
};
export default function PostFormPage({ edit = false }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    ...empty,
    boardType: params.get("boardType") ?? "ERROR_WIKI",
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, isLoading] = useState(false);
  useEffect(() => {
    if (edit)
      api
        .get(`/posts/${id}`)
        .then((r) => setForm({ ...empty, ...unwrap(r) }))
        .catch(() => nav("/error-wiki"));
  }, [edit, id, nav]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function recommend() {
    if (!form.errorMessage.trim()) {
      setMessage("오류 메시지를 먼저 입력하세요.");
      return;
    }
    setBusy(true);
    setMessage("");
    isLoading(true);
    try {
      const r = unwrap(
        await api.post("/ai/recommend", {
          errorMessage: form.errorMessage,
          cause: form.cause,
          solution: form.solution,
        }),
      );
      setForm((f) => ({ ...f, title: r.title, category: r.category }));
      setMessage(r.notice ?? "Ollama 추천을 적용했습니다.");
    } catch (e) {
      setMessage(e.userMessage ?? "AI 추천에 실패했습니다.");
    } finally {
      isLoading(false);
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append(
        "data",
        new Blob([JSON.stringify(form)], { type: "application/json" }),
      );
      files.forEach((f) => body.append("files", f));
      const r = edit
        ? await api.put(`/posts/${id}`, body)
        : await api.post("/posts", body);
      nav(`/posts/${unwrap(r).postId}`);
    } catch (err) {
      setMessage(err.userMessage ?? "게시글 저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }
  const isError = form.boardType === "ERROR_WIKI";
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
            {["ERROR_WIKI", "FREE"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => set("boardType", t)}
                className={
                  form.boardType === t ? "btn-primary" : "btn-secondary"
                }
              >
                {t === "ERROR_WIKI" ? "에러위키" : "자유게시판"}
              </button>
            ))}
          </div>
        </div>
        <F
          label="제목"
          value={form.title}
          on={(v) => set("title", v)}
          required
        />
        {isError && (
          <>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label>
                <span className="label">카테고리</span>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn-secondary self-end"
                disabled={busy}
                onClick={recommend}
              >
                {loading ? "제목·분류 추천 고민중..." : "✨ AI 제목·분류 추천"}
              </button>
            </div>
            <T
              label="오류 메시지"
              value={form.errorMessage}
              on={(v) => set("errorMessage", v)}
              required
            />
            <T
              label="발생 환경"
              value={form.environment}
              on={(v) => set("environment", v)}
            />
            <T
              label="원인"
              value={form.cause}
              on={(v) => set("cause", v)}
              required
            />
            <T
              label="해결 방법"
              value={form.solution}
              on={(v) => set("solution", v)}
              required
            />
          </>
        )}
        <T
          label={isError ? "추가 설명" : "내용"}
          value={form.content}
          on={(v) => set("content", v)}
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
            onChange={(e) => setFiles([...e.target.files].slice(0, 5))}
          />
          <p className="mt-2 text-xs text-[#667085]">
            선택: {files.map((f) => f.name).join(", ") || "없음"}
          </p>
        </label>
        {message && (
          <p
            className={
              message.includes("실패")
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
            onClick={() => nav(-1)}
          >
            취소
          </button>
          <button disabled={busy} className="btn-primary disabled:opacity-50">
            {busy ? "처리 중..." : edit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>
    </section>
  );
}
function F({ label, value, on, required }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input
        className="input"
        value={value}
        onChange={(e) => on(e.target.value)}
        required={required}
      />
    </label>
  );
}
function T({ label, value, on, required, rows = 5, placeholder }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea
        className="input"
        rows={rows}
        value={value ?? ""}
        onChange={(e) => on(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
