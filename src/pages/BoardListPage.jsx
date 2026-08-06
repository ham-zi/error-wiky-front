import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import api, { unwrap } from "../api";
import { useAuth } from "../auth/AuthContext";
import { categories, categoryLabels } from "../constants/categories";

export default function BoardListPage({ boardType }) {
  const { user } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const keyword = params.get("keyword") ?? "";
  const category = params.get("category") ?? "";
  const mine = params.get("mine") === "true";
  const page = params.get("page") ?? 0;

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get("/posts", {
        params: {
          boardType,
          keyword: keyword || undefined,
          category:
            boardType === "ERROR_WIKI" && category ? category : undefined,
          mine,
          page,
          size: 10,
        },
      })
      .then((response) => {
        setData(unwrap(response));
      })
      .catch((requestError) => {
        setError(
          requestError.userMessage ?? "게시글 목록을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [boardType, keyword, category, mine, page]);

  function search(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const searchedKeyword = formData.get("keyword");
    const searchedCategory = formData.get("category");

    setParams({
      ...(searchedKeyword ? { keyword: searchedKeyword } : {}),
      ...(boardType === "ERROR_WIKI" && searchedCategory
        ? { category: searchedCategory }
        : {}),
      ...(mine ? { mine: "true" } : {}),
      page: "0",
    });
  }

  function toggleMine() {
    const nextParams = new URLSearchParams(params);

    if (mine) {
      nextParams.delete("mine");
    } else {
      nextParams.set("mine", "true");
    }

    nextParams.set("page", "0");
    setParams(nextParams);
  }

  function movePage(nextPage) {
    const nextParams = new URLSearchParams(params);

    nextParams.set("page", String(nextPage));
    setParams(nextParams);
  }

  const title = boardType === "ERROR_WIKI" ? "에러위키" : "자유게시판";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="font-bold text-[#ff512f]">ERROR WIKY</p>

          <h1 className="mt-1 text-3xl font-black">{title}</h1>

          <p className="mt-2 text-[#667085]">
            {boardType === "ERROR_WIKI"
              ? "오류와 해결 과정을 검색하고 공유합니다."
              : "개발 이야기를 자유롭게 나눕니다."}
          </p>
        </div>

        {user && (
          <Link
            to={`/posts/new?boardType=${boardType}`}
            className="btn-primary"
          >
            + 게시글 작성
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <form
          onSubmit={search}
          className="flex flex-col gap-3 border-b border-[#e4e7ec] bg-[#fcfcfd] p-5 md:flex-row"
        >
          {boardType === "ERROR_WIKI" && (
            <select
              name="category"
              defaultValue={category}
              className="input md:max-w-52"
            >
              <option value="">전체 카테고리</option>

              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          )}

          <input
            name="keyword"
            defaultValue={keyword}
            className="input flex-1"
            placeholder="제목 또는 내용 검색"
          />

          <button type="submit" className="btn-primary">
            검색
          </button>

          {user && (
            <button
              type="button"
              className={`btn-secondary ${
                mine ? "!border-[#ff512f] !text-[#ff512f]" : ""
              }`}
              onClick={toggleMine}
            >
              내 글
            </button>
          )}
        </form>

        <div className="flex items-center justify-between border-b border-[#e4e7ec] px-5 py-4 text-sm text-[#667085]">
          <span>
            총 <b className="text-[#101828]">{data.totalElements}</b>건
          </span>

          <span>{mine ? "내가 작성한 목록" : "전체 공개 목록"}</span>
        </div>

        {loading ? (
          <State text="불러오는 중..." />
        ) : error ? (
          <State text={error} error />
        ) : data.content.length === 0 ? (
          <State text="등록된 게시글이 없습니다." />
        ) : (
          <ul className="divide-y divide-[#e4e7ec]">
            {data.content.map((post) => (
              <li key={post.postId}>
                <Link
                  to={`/posts/${post.postId}`}
                  state={{
                    from: location.pathname + location.search,
                  }}
                  className="grid gap-2 px-5 py-5 hover:bg-[#fff8f6] md:grid-cols-[1fr_120px_100px_160px] md:items-center"
                >
                  <div>
                    <b>{post.title}</b>

                    <div className="mt-1 text-xs text-[#98a2b3] md:hidden">
                      {post.authorName}
                    </div>
                  </div>

                  <span className="text-sm text-[#ff512f]">
                    {boardType === "ERROR_WIKI"
                      ? (categoryLabels[post.category] ??
                        post.category ??
                        "기타")
                      : "자유"}
                  </span>

                  <span className="text-sm text-[#475467]">
                    {post.authorName}
                  </span>

                  <span className="text-xs text-[#667085]">
                    조회 {post.viewCount} · 좋아요 {post.likeCount} · 댓글{" "}
                    {post.commentCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data.totalPages > 0 && (
          <div className="flex justify-center gap-2 border-t border-[#e4e7ec] p-5">
            {Array.from({ length: data.totalPages }, (_, index) => index)
              .slice(Math.max(0, data.page - 2), data.page + 3)
              .map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={
                    pageNumber === data.page
                      ? "btn-primary !px-3 !py-2"
                      : "btn-secondary !px-3 !py-2"
                  }
                  onClick={() => movePage(pageNumber)}
                >
                  {pageNumber + 1}
                </button>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function State({ text, error = false }) {
  return (
    <div
      className={`p-16 text-center ${
        error ? "text-red-600" : "text-[#667085]"
      }`}
    >
      {text}
    </div>
  );
}
