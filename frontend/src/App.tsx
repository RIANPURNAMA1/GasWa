import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import LayoutDashbaord from "./LayoutDashboard";
import InboxView from "./features/InboxView";
import KirimPesan from "./features/KirimPesan";

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
      {/* Jika kamu ingin loading spinner muncul secara global, letakkan di sini */}
      {loading && <div className="fixed top-0 left-0 w-full h-1 bg-green-500 z-[9999]" />}

      <Routes>
        {/* 1. Parent Route: LayoutDashboard membungkus Route yang butuh Sidebar/Header */}
        <Route path="/" element={<LayoutDashbaord />}>
          
          {/* Halaman Dashboard Utama (index) */}
          <Route index element={<div className="p-10">Selamat Datang di Dashboard</div>} />

          {/* 2. Child Routes: Akan merender komponen di dalam <Outlet /> milik Layout */}
          <Route path="inbox" element={<InboxView />} />
          <Route path="send" element={<KirimPesan/>} />
          <Route path="contacts" element={<div className="p-10">Halaman Kontak</div>} />
        </Route>

        {/* 3. Route di LUAR Layout (Tanpa Sidebar/Header) */}
        <Route path="/login" element={<div>Halaman Login</div>} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
