import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search, Globe, Sun, Moon } from "lucide-react";
// Import hook context theme yang kita buat sebelumnya
import { useTheme } from "../context/ThemeContext"; 

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  // Ambil state isDark dan fungsi toggle dari context
  const { isDark, toggleTheme } = useTheme();

 const getPageTitle = (path: string): string => {
  switch (path) {
    case "/": 
      return "Ringkasan Dashboard";
    case "/inbox": 
      return "Kotak Masuk"; // Karena menggabungkan WA, IG, FB
    case "/send": 
      return "Kirim Pesan";
    case "/chat": 
      return "Riwayat Percakapan";
    case "/contacts": 
      return "Daftar Kontak";
    case "/broadcast": 
      return "Pesan Massal"; // Atau "Kampanye Siaran"
    case "/bot": 
      return "Bot Otomatisasi";
    case "/device": 
      return "Status Perangkat";
    case "/api": 
      return "Konfigurasi API";
    default: 
      return "PaduPesan"; // Ganti dengan nama sistem pilihanmu (contoh: PaduPesan/SatSet)
  }
};
  return (
    <header className="sticky top-0 z-30 transition-colors duration-500 bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg border-b border-slate-200 dark:border-white/5">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        
        {/* Left Side: Menu & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase transition-colors">
              {getPageTitle(location.pathname)}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              <Globe size={10} />
              <span>Production Environment</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-500 dark:text-slate-400"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400 animate-pulse" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>

          {/* Search */}
          <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hidden sm:flex">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors group">
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#0f172a] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight transition-colors">Admin Rian</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <p className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-tighter transition-colors">Online</p>
              </div>
            </div>
            
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform border border-white/10">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;