import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import TroubleshootingListPage from "./pages/troubleshooting/TroubleshootingListPage";
import TroubleshootingDetailPage from "./pages/troubleshooting/TroubleshootingDetailPage";
import TroubleshootingCreatePage from "./pages/troubleshooting/TroubleshootingCreatePage";
import TroubleshootingEditPage from "./pages/troubleshooting/TroublesshootingEditPage";

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f2f2f2]">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/troubleshooting"
            element={<TroubleshootingListPage />}
          />

          <Route
            path="/troubleshooting/new"
            element={<TroubleshootingCreatePage />}
          />

          <Route
            path="/troubleshooting/:troubleshootingId/edit"
            element={<TroubleshootingEditPage />}
          />

          <Route
            path="/troubleshooting/:troubleshootingId"
            element={<TroubleshootingDetailPage />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default AppLayout;
