import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BoardListPage from "./pages/BoardListPage";
import PostFormPage from "./pages/PostFormPage";
import PostDetailPage from "./pages/PostDetailPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-[#e4e7ec] bg-white py-8 text-center text-sm text-[#667085]">
        ERROR WIKY · 개발 오류를 지식으로 바꾸는 공간
      </footer>
    </div>
  );
}
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center">로그인 확인 중...</div>;
  return user ? children : <Navigate to="/auth/login" replace />;
}
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/oauth2/success" element={<OAuthSuccessPage />} />
          <Route
            path="/error-wiki"
            element={<BoardListPage boardType="ERROR_WIKI" />}
          />
          <Route path="/free" element={<BoardListPage boardType="FREE" />} />
          <Route
            path="/posts/new"
            element={
              <Protected>
                <PostFormPage />
              </Protected>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <Protected>
                <PostFormPage edit />
              </Protected>
            }
          />
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
