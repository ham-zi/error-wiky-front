import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMyTroubleshootings,
  getTroubleshootings,
} from "../../api/troubleshootingApi";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  {
    value: "JAVA",
    label: "Java",
  },
  {
    value: "SPRING",
    label: "Spring",
  },
  {
    value: "DATABASE",
    label: "Database",
  },
  {
    value: "REACT",
    label: "React",
  },
  {
    value: "NETWORK",
    label: "Network",
  },
  {
    value: "DEPLOYMENT",
    label: "Deployment",
  },
  {
    value: "ETC",
    label: "기타",
  },
];

const EMPTY_PAGE_DATA = {
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

function TroubleshootingListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const scope = searchParams.get("scope") === "mine" ? "mine" : "all";

  const page = parsePage(searchParams.get("page"));
  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";

  const [keywordInput, setKeywordInput] = useState(keyword);

  const [pageData, setPageData] = useState(EMPTY_PAGE_DATA);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [reloadCount, setReloadCount] = useState(0);

  const isMine = scope === "mine";

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTroubleshootings = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const request = isMine ? getMyTroubleshootings : getTroubleshootings;

        const response = await request({
          page,
          size: PAGE_SIZE,
          keyword,
          category,
          signal: controller.signal,
        });

        const responseData = response?.data;

        if (!responseData || !Array.isArray(responseData.content)) {
          throw new Error("목록 응답 형식이 올바르지 않습니다.");
        }

        setPageData({
          content: responseData.content,
          page:
            typeof responseData.page === "number" ? responseData.page : page,
          size:
            typeof responseData.size === "number"
              ? responseData.size
              : PAGE_SIZE,
          totalElements:
            typeof responseData.totalElements === "number"
              ? responseData.totalElements
              : 0,
          totalPages:
            typeof responseData.totalPages === "number"
              ? responseData.totalPages
              : 0,
          first: Boolean(responseData.first),
          last: Boolean(responseData.last),
        });
      } catch (error) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          return;
        }

        setPageData(EMPTY_PAGE_DATA);
        setErrorMessage(
          getRequestErrorMessage(
            error,
            "트러블슈팅 목록을 불러오지 못했습니다.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTroubleshootings();

    return () => {
      controller.abort();
    };
  }, [isMine, page, keyword, category, reloadCount]);

  const visiblePages = useMemo(
    () => createVisiblePages(pageData.page, pageData.totalPages),
    [pageData.page, pageData.totalPages],
  );

  const updateSearchParams = (updates, replace = false) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      const shouldRemove =
        value === undefined ||
        value === null ||
        value === "" ||
        (key === "page" && Number(value) === 0) ||
        (key === "scope" && value === "all");

      if (shouldRemove) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    setSearchParams(nextParams, {
      replace,
    });
  };

  const handleScopeChange = (nextScope) => {
    if (nextScope === scope) {
      return;
    }

    updateSearchParams({
      scope: nextScope,
      page: 0,
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateSearchParams({
      keyword: keywordInput.trim(),
      page: 0,
    });
  };

  const handleCategoryChange = (event) => {
    updateSearchParams({
      category: event.target.value,
      page: 0,
    });
  };

  const handleResetFilters = () => {
    setKeywordInput("");

    updateSearchParams({
      keyword: "",
      category: "",
      page: 0,
    });
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 0 ||
      nextPage >= pageData.totalPages ||
      nextPage === pageData.page
    ) {
      return;
    }

    updateSearchParams({
      page: nextPage,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDetailMove = (troubleshootingId) => {
    navigate(`/troubleshooting/${troubleshootingId}`);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[#ff512f]">ERROR WIKY</p>

        <h1 className="text-3xl font-bold tracking-tight text-[#101828]">
          트러블슈팅
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667085]">
          개발 중 발생한 오류와 해결 방법을 확인할 수 있습니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm">
        <div className="border-b border-[#e4e7ec] px-5 pt-5 sm:px-7">
          <div
            className="flex gap-7"
            role="tablist"
            aria-label="트러블슈팅 목록 범위"
          >
            <ScopeTab active={!isMine} onClick={() => handleScopeChange("all")}>
              모든 트러블슈팅
            </ScopeTab>

            <ScopeTab active={isMine} onClick={() => handleScopeChange("mine")}>
              내 트러블슈팅
            </ScopeTab>
          </div>
        </div>

        <div className="border-b border-[#e4e7ec] bg-[#fcfcfd] p-5 sm:p-7">
          <form
            className="flex flex-col gap-3 lg:flex-row"
            onSubmit={handleSearch}
          >
            <div className="w-full lg:max-w-[220px]">
              <label htmlFor="category" className="sr-only">
                카테고리
              </label>

              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="h-11 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm text-[#344054] outline-none transition focus:border-[#ff512f] focus:ring-2 focus:ring-[#ff512f]/15"
              >
                <option value="">전체 카테고리</option>

                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-0 flex-1">
              <label htmlFor="keyword" className="sr-only">
                검색어
              </label>

              <input
                id="keyword"
                type="search"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="제목, 오류 메시지, 원인 또는 해결 방법 검색"
                className="h-11 min-w-0 flex-1 rounded-l-lg border border-r-0 border-[#d0d5dd] bg-white px-4 text-sm text-[#101828] outline-none placeholder:text-[#98a2b3] focus:border-[#ff512f] focus:ring-2 focus:ring-[#ff512f]/15"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 shrink-0 rounded-r-lg bg-[#ff512f] px-6 text-sm font-semibold text-white transition hover:bg-[#ed4324] disabled:cursor-not-allowed disabled:bg-[#ff9a86]"
              >
                검색
              </button>
            </div>

            {(keyword || category) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 rounded-lg border border-[#d0d5dd] bg-white px-5 text-sm font-semibold text-[#475467] transition hover:bg-[#f9fafb]"
              >
                초기화
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center justify-between border-b border-[#e4e7ec] px-5 py-4 sm:px-7">
          <p className="text-sm text-[#667085]">
            총{" "}
            <strong className="font-semibold text-[#101828]">
              {pageData.totalElements}
            </strong>
            건
          </p>

          <p className="text-sm text-[#667085]">
            {isMine ? "내가 작성한 목록" : "전체 공개 목록"}
          </p>
        </div>

        <ListContent
          pageData={pageData}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => setReloadCount((previous) => previous + 1)}
          onDetailMove={handleDetailMove}
        />

        {!isLoading && !errorMessage && pageData.totalPages > 0 && (
          <Pagination
            currentPage={pageData.page}
            totalPages={pageData.totalPages}
            visiblePages={visiblePages}
            first={pageData.first}
            last={pageData.last}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}

function ScopeTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "border-b-2 pb-4 text-sm font-semibold transition",
        active
          ? "border-[#ff512f] text-[#ff512f]"
          : "border-transparent text-[#667085] hover:text-[#344054]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ListContent({
  pageData,
  isLoading,
  errorMessage,
  onRetry,
  onDetailMove,
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-72 items-center justify-center px-6 py-16"
      >
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#ffd5cc] border-t-[#ff512f]" />

          <p className="mt-4 text-sm text-[#667085]">
            트러블슈팅을 불러오는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-72 items-center justify-center px-6 py-16">
        <div className="text-center">
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (pageData.content.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center px-6 py-16">
        <div className="text-center">
          <p className="text-base font-semibold text-[#344054]">
            조회된 트러블슈팅이 없습니다.
          </p>

          <p className="mt-2 text-sm text-[#98a2b3]">
            검색 조건을 변경하거나 새로운 트러블슈팅을 등록해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,1fr)_140px_120px_120px] gap-4 border-b border-[#e4e7ec] bg-[#f9fafb] px-7 py-3 text-xs font-semibold text-[#667085] md:grid">
        <span>제목</span>
        <span>카테고리</span>
        <span>작성자</span>
        <span>작성일</span>
      </div>

      <ul className="divide-y divide-[#e4e7ec]">
        {pageData.content.map((item) => (
          <li key={item.troubleshootingId}>
            <button
              type="button"
              onClick={() => onDetailMove(item.troubleshootingId)}
              className="grid w-full gap-3 px-5 py-5 text-left transition hover:bg-[#fff8f6] sm:px-7 md:grid-cols-[minmax(0,1fr)_140px_120px_120px] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#101828]">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-[#98a2b3] md:hidden">
                  {item.authorName} · {formatDate(item.createdAt)}
                </p>
              </div>

              <div>
                <CategoryBadge category={item.category} />
              </div>

              <span className="hidden truncate text-sm text-[#475467] md:block">
                {item.authorName}
              </span>

              <time
                dateTime={item.createdAt}
                className="hidden text-sm text-[#667085] md:block"
              >
                {formatDate(item.createdAt)}
              </time>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-flex rounded-full bg-[#fff0ed] px-2.5 py-1 text-xs font-semibold text-[#e63e20]">
      {getCategoryLabel(category)}
    </span>
  );
}

function Pagination({
  currentPage,
  totalPages,
  visiblePages,
  first,
  last,
  onPageChange,
}) {
  return (
    <nav
      aria-label="트러블슈팅 페이지 이동"
      className="flex items-center justify-center gap-1 border-t border-[#e4e7ec] px-4 py-6"
    >
      <button
        type="button"
        disabled={first}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 rounded-md border border-[#d0d5dd] px-3 text-sm font-medium text-[#475467] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>

      {visiblePages.map((pageNumber) => {
        const active = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
            className={[
              "h-9 min-w-9 rounded-md px-2 text-sm font-semibold transition",
              active
                ? "bg-[#ff512f] text-white"
                : "text-[#475467] hover:bg-[#f2f4f7]",
            ].join(" ")}
          >
            {pageNumber + 1}
          </button>
        );
      })}

      <button
        type="button"
        disabled={last}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 rounded-md border border-[#d0d5dd] px-3 text-sm font-medium text-[#475467] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>

      <span className="sr-only">총 {totalPages}페이지</span>
    </nav>
  );
}

function parsePage(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function createVisiblePages(currentPage, totalPages) {
  if (totalPages <= 0) {
    return [];
  }

  const maxVisibleCount = 5;
  const half = Math.floor(maxVisibleCount / 2);

  let start = Math.max(currentPage - half, 0);

  let end = Math.min(start + maxVisibleCount, totalPages);

  start = Math.max(end - maxVisibleCount, 0);

  return Array.from(
    {
      length: end - start,
    },
    (_, index) => start + index,
  );
}

function getCategoryLabel(category) {
  const option = CATEGORY_OPTIONS.find((item) => item.value === category);

  if (option) {
    return option.label;
  }

  return category?.replaceAll("_", " ") ?? "분류 없음";
}

function formatDate(dateTime) {
  if (!dateTime) {
    return "-";
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getRequestErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.response.data?.message ?? fallbackMessage;
}

export default TroubleshootingListPage;
