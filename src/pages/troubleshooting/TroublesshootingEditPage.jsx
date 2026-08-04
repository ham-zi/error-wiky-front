import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getTroubleshootingDetail,
  updateTroubleshooting,
} from "../../api/troubleshootingApi";
import TroubleshootingForm from "./TroubleshootingForm";

function TroubleshootingEditPage() {
  const navigate = useNavigate();
  const { troubleshootingId } = useParams();

  const [initialValues, setInitialValues] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [reloadCount, setReloadCount] = useState(0);

  const parsedTroubleshootingId = Number(troubleshootingId);

  useEffect(() => {
    if (
      !Number.isInteger(parsedTroubleshootingId) ||
      parsedTroubleshootingId <= 0
    ) {
      setInitialValues(null);
      setIsLoading(false);
      setErrorMessage("올바르지 않은 트러블슈팅 번호입니다.");

      return undefined;
    }

    const controller = new AbortController();

    const fetchTroubleshooting = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getTroubleshootingDetail(
          parsedTroubleshootingId,
          {
            signal: controller.signal,
          },
        );

        if (!response?.data) {
          throw new Error("상세 응답 형식이 올바르지 않습니다.");
        }

        setInitialValues({
          title: response.data.title ?? "",
          category: response.data.category ?? "",
          problemSituation: response.data.problemSituation ?? "",
          errorMessage: response.data.errorMessage ?? "",
          cause: response.data.cause ?? "",
          solution: response.data.solution ?? "",
        });
      } catch (error) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          return;
        }

        setInitialValues(null);
        setErrorMessage(getLoadErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTroubleshooting();

    return () => {
      controller.abort();
    };
  }, [parsedTroubleshootingId, reloadCount]);

  const handleSubmit = async (requestData) => {
    await updateTroubleshooting(parsedTroubleshootingId, requestData);

    navigate(`/troubleshooting/${parsedTroubleshootingId}`, {
      replace: true,
    });
  };

  if (isLoading) {
    return <PageLoading message="수정할 트러블슈팅을 불러오는 중입니다." />;
  }

  if (errorMessage || !initialValues) {
    return (
      <PageError
        message={errorMessage || "트러블슈팅 정보를 불러올 수 없습니다."}
        onRetry={() => setReloadCount((previousCount) => previousCount + 1)}
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[#ff512f]">ERROR WIKY</p>

        <h1 className="text-3xl font-bold tracking-tight text-[#101828]">
          트러블슈팅 수정
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667085]">
          기존 내용을 수정하거나 Ollama 추천을 받아 제목과 분류를 다시 설정할 수
          있습니다.
        </p>
      </div>

      <TroubleshootingForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        cancelTo={`/troubleshooting/${parsedTroubleshootingId}`}
      />
    </section>
  );
}

function PageLoading({ message }) {
  return (
    <section className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center px-4 py-12">
      <div role="status" className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#ffd5cc] border-t-[#ff512f]" />

        <p className="mt-4 text-sm text-[#667085]">{message}</p>
      </div>
    </section>
  );
}

function PageError({ message, onRetry }) {
  return (
    <section className="mx-auto flex min-h-[500px] w-full max-w-5xl items-center justify-center px-4 py-12">
      <div className="text-center">
        <p role="alert" className="text-sm font-medium text-red-600">
          {message}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/troubleshooting"
            className="rounded-lg border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
          >
            목록으로
          </Link>

          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-[#ff512f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ed4324]"
          >
            다시 시도
          </button>
        </div>
      </div>
    </section>
  );
}

function getLoadErrorMessage(error) {
  if (!error.response) {
    return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.response.status === 404) {
    return "수정할 트러블슈팅을 찾을 수 없습니다.";
  }

  return error.response.data?.message ?? "트러블슈팅을 불러오지 못했습니다.";
}

export default TroubleshootingEditPage;
