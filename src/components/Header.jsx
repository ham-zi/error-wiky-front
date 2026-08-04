import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const DEFAULT_ROUTES = {
  home: "/",
  troubleshooting: "/troubleshooting",
  help: "/help",
  about: "/about",
  signup: "/signup",
  login: "/login",
  myPage: "/mypage",
};

function getNavigationClass({ isActive }) {
  return [
    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[#ff572f] focus-visible:ring-offset-2",
    isActive
      ? "text-[#ff572f]"
      : "text-slate-700 hover:bg-orange-50 hover:text-[#ff572f]",
  ].join(" ");
}

function Header({
  isAuthenticated = false,
  isAuthLoading = false,
  onLogout,
  routes = {},
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const resolvedRoutes = {
    ...DEFAULT_ROUTES,
    ...routes,
  };

  const navigationItems = [
    {
      label: "트러블슈팅",
      path: resolvedRoutes.troubleshooting,
      end: false,
    },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (typeof onLogout !== "function") {
      setLogoutError(
        "로그아웃 처리 함수가 연결되지 않았습니다. 인증 Context의 logout 함수를 전달해 주세요.",
      );
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await onLogout();

      setIsMenuOpen(false);
      navigate(resolvedRoutes.login, {
        replace: true,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.";

      setLogoutError(
        typeof errorMessage === "string"
          ? errorMessage
          : "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderAuthActions = (isMobile = false) => {
    const commonClass = isMobile
      ? "flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors"
      : "flex h-9 min-w-[108px] items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors";

    if (isAuthLoading) {
      return (
        <div
          role="status"
          aria-live="polite"
          className={`${commonClass} cursor-wait bg-slate-100 text-slate-500`}
        >
          Checking...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <>
          <NavLink
            to={resolvedRoutes.signup}
            className={`${commonClass} border border-[#ff572f] bg-white text-[#ff572f] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2`}
          >
            회원가입
          </NavLink>

          <NavLink
            to={resolvedRoutes.login}
            className={`${commonClass} bg-[#ff572f] text-white hover:bg-[#e94b25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2`}
          >
            로그인
          </NavLink>
        </>
      );
    }

    return (
      <>
        <NavLink
          to={resolvedRoutes.myPage}
          className={`${commonClass} border border-[#ff572f] bg-white text-[#ff572f] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2`}
        >
          내정보조회
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`${commonClass} bg-[#ff572f] text-white hover:bg-[#e94b25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-orange-300`}
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </>
    );
  };

  return (
    <header className="w-full bg-[#f2f2f2] px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex min-h-[64px] items-center justify-between rounded-full bg-white px-5 shadow-sm sm:px-7 lg:px-12">
          <NavLink
            to={resolvedRoutes.home}
            end
            aria-label="ERROR WIKY 홈으로 이동"
            className="shrink-0 rounded-md text-xl font-bold tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2"
          >
            <span className="text-[#ff572f]">ERROR</span>
            <span className="ml-1 text-slate-900">WIKY</span>
          </NavLink>

          <nav
            aria-label="주요 메뉴"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={getNavigationClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {renderAuthActions()}
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-header-menu"
            onClick={() => {
              setIsMenuOpen((previous) => !previous);
              setLogoutError("");
            }}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white lg:hidden"
          >
            <span
              className={`h-0.5 w-5 bg-slate-900 transition-transform ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-slate-900 transition-opacity ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-slate-900 transition-transform ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-header-menu"
            className="mt-3 rounded-3xl bg-white p-5 shadow-md lg:hidden"
          >
            <nav aria-label="모바일 주요 메뉴" className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-orange-50 text-[#ff572f]"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="my-4 h-px bg-slate-200" />

            <div className="flex flex-col gap-3">{renderAuthActions(true)}</div>
          </div>
        )}

        {logoutError && (
          <div
            role="alert"
            className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {logoutError}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
