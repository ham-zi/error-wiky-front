import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTroubleshootingDetail } from "../../api/troubleshootingApi";

function TroubleshootingDetailPage() {
  const { troubleshootingId } = useParams();

  const [troubleshooting, setTroubleshooting] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const parsedId = Number(troubleshootingId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setIsLoading(false);
      setErrorMessage("올바르지 않은 트러블슈팅 번호입니다.");
      return undefined;
    }

    const controller = new AbortController();

    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getTroubleshootingDetail(parsedId, {
          signal: controller.signal,
        });

        if (!response?.data) {
          throw new Error("상세 응답 형식이 올바르지 않습니다.");
        }

        setTroubleshooting(response.data);
      } catch (error) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          return;
        }

        setTroubleshooting(null);
        setErrorMessage(
          getRequestErrorMessage(error, "트러블슈팅을 불러오지 못했습니다."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [troubleshootingId, reloadCount]);

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#ffd5cc] border-t-[#ff512f]" />

          <p className="mt-4 text-sm text-[#667085]">
            트러블슈팅을 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/troubleshooting"
              className="rounded-lg border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054]"
            >
              목록으로
            </Link>

            <button
              type="button"
              onClick={() => setReloadCount((previous) => previous + 1)}
              className="rounded-lg bg-[#ff512f] px-5 py-2.5 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/troubleshooting"
        className="inline-flex text-sm font-semibold text-[#667085] transition hover:text-[#ff512f]"
      >
        ← 목록으로 돌아가기
      </Link>

      <article className="mt-5 overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm">
        <header className="border-b border-[#e4e7ec] px-6 py-7 sm:px-9">
          <span className="inline-flex rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-semibold text-[#e63e20]">
            {formatCategory(troubleshooting.category)}
          </span>

          <h1 className="mt-4 text-2xl font-bold leading-9 text-[#101828] sm:text-3xl">
            {troubleshooting.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#667085]">
            <span>
              작성자{" "}
              <strong className="font-semibold text-[#344054]">
                {troubleshooting.authorName}
              </strong>
            </span>

            <span>작성일 {formatDateTime(troubleshooting.createdAt)}</span>

            {troubleshooting.updatedAt &&
              troubleshooting.updatedAt !== troubleshooting.createdAt && (
                <span>수정일 {formatDateTime(troubleshooting.updatedAt)}</span>
              )}
          </div>
        </header>

        <div className="space-y-10 px-6 py-8 sm:px-9">
          <DetailSection title="문제 상황">
            {troubleshooting.problemSituation}
          </DetailSection>

          {troubleshooting.errorMessage && (
            <DetailSection title="오류 메시지">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#101828] p-5 font-mono text-sm leading-6 text-white">
                {troubleshooting.errorMessage}
              </pre>
            </DetailSection>
          )}

          <DetailSection title="원인">{troubleshooting.cause}</DetailSection>

          <DetailSection title="해결 방법">
            {troubleshooting.solution}
          </DetailSection>
        </div>
      </article>
    </section>
  );
}

function DetailSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-[#101828]">{title}</h2>

      {typeof children === "string" ? (
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#475467] sm:text-base">
          {children}
        </p>
      ) : (
        children
      )}
    </section>
  );
}

function formatCategory(category) {
  return category?.replaceAll("_", " ") ?? "분류 없음";
}

function formatDateTime(dateTime) {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRequestErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.response.data?.message ?? fallbackMessage;
}

export default TroubleshootingDetailPage;
