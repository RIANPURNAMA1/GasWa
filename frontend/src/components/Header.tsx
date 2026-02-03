import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";

// 1. Definisi Interface untuk Props
interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // 2. Mapping path ke judul dengan type safety
  const getPageTitle = (path: string): string => {
    switch (path) {
      case "/": return "Dashboard Overview";
      case "/inbox": return "Messages & Chat";
      case "/send": return "Kirim Pesan";
      case "/contacts": return "Kontak Pelanggan";
      case "/broadcast": return "Broadcast Campaign";
      case "/bot": return "Auto Reply Bot";
      case "/device": return "Device Status";
      case "/api": return "API Settings";
      default: return "WA Sender Pro";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          {/* Burger Menu Mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-slate-900 transition-all">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search Button (Optional) */}
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hidden sm:flex">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
            <Bell className="w-5 h-5 text-slate-600 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Mini Profile */}
          <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight">Admin User</p>
              <p className="text-[10px] text-green-500 font-medium">Online</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;