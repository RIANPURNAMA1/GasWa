import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const LayoutDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0f172a] dark:bg-gradient-to-br dark:from-[#1e3a8a] dark:via-[#1e293b] dark:to-[#0f172a] text-slate-900 dark:text-white">
      {/* Overlay Mobile: Memberikan efek gelap pada konten saat sidebar muncul */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Mengontrol posisi dirinya sendiri lewat props isOpen */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header: Kirimkan fungsi untuk mengubah state ke true */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutDashboard;
