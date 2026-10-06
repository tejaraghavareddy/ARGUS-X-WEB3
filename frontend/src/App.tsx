import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ToastStack } from "./components/ToastStack";
import { WalletModal } from "./components/WalletModal";
import { AdminPage } from "./pages/AdminPage";
import { CertificateDetailPage } from "./pages/CertificateDetailPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IssuePage } from "./pages/IssuePage";
import { LandingPage } from "./pages/LandingPage";
import { VerifyPage } from "./pages/VerifyPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/issue" element={<IssuePage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/certificate/:tokenId" element={<CertificateDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      <WalletModal />
      <ToastStack />
    </div>
  );
}
