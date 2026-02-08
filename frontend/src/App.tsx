import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import LayoutDashboard from "./LayoutDashboard";
import InboxView from "./features/InboxView";
import KirimPesan from "./features/KirimPesan";
import DashboardView from "./features/DashboardView";

// 1. IMPORT ThemeProvider di sini
import { ThemeProvider } from "./context/ThemeContext";
import ChatView from "./features/ChatView";
import DeviceStatus from "./features/DeviceStatus";
import QRScanner from "./features/QRScanner";
import ContactsView from "./features/ContactsView";
import Login from "./auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      {/* Loading bar yang adaptif terhadap warna tema */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 z-[9999] animate-pulse" />
      )}

      <Routes>
        {/* 🔒 DASHBOARD (HARUS LOGIN) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardView />} />
          <Route path="inbox" element={<InboxView />} />
          <Route path="send" element={<KirimPesan />} />
          <Route path="chat" element={<ChatView />} />
          <Route path="device" element={<DeviceStatus />} />
          <Route path="add-device" element={<QRScanner />} />
          <Route path="contacts" element={<ContactsView />} />
        </Route>

        {/* 🚫 LOGIN (TIDAK BISA DIAKSES JIKA SUDAH LOGIN) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  // 2. BUNGKUS Router dengan ThemeProvider
  <ThemeProvider>
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;
