import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const active = ({ isActive }) =>
    `text-sm font-bold ${isActive ? "text-[#ff512f]" : "text-[#475467] hover:text-[#101828]"}`;
  return (
    <header className="sticky top-0 z-20 border-b border-[#e4e7ec] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link
          to="/"
          className="text-xl font-black tracking-tight text-[#101828]"
        >
          ERROR <span className="text-[#ff512f]">WIKY</span>
        </Link>
        <nav className="flex flex-1 gap-6">
          <NavLink to="/error-wiki" className={active}>
            에러위키
          </NavLink>
          <NavLink to="/free" className={active}>
            자유게시판
          </NavLink>
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#667085] sm:inline">
              {user.name}님
            </span>
            <button
              className="btn-secondary !py-2"
              onClick={() => nav("/error-wiki?mine=true")}
            >
              내 글
            </button>
            <button className="btn-secondary !py-2" onClick={logout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link className="btn-secondary !py-2" to="/auth/login">
              로그인
            </Link>
            <Link className="btn-primary !py-2" to="/auth/signup">
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
