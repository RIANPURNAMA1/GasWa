import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  Send,
  Users,
  Radio,
  Bot,
  Smartphone,
  Key,
  X,
  MoreVertical,
} from "lucide-react";
import NavItem from "./NavItem";

// 1. Definisi Interface untuk Props
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper untuk navigasi sekaligus menutup sidebar di mobile
  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false); 
  };

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">WA Sender Pro</h1>
              <p className="text-xs text-slate-500">Broadcast System</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            icon={Activity}
            label="Dashboard"
            active={isActive("/")}
            onClick={() => handleNavClick("/")}
          />
          <NavItem
            icon={MessageSquare}
            label="Inbox"
            active={isActive("/inbox")}
            onClick={() => handleNavClick("/inbox")}
          />
          <NavItem
            icon={Send}
            label="Kirim Pesan"
            active={isActive("/send")}
            onClick={() => handleNavClick("/send")}
          />
          <NavItem
            icon={Users}
            label="Kontak"
            active={isActive("/contacts")}
            onClick={() => handleNavClick("/contacts")}
          />
          <NavItem
            icon={Radio}
            label="Broadcast"
            badge="PRO"
            active={isActive("/broadcast")}
            onClick={() => handleNavClick("/broadcast")}
          />
          <NavItem
            icon={Bot}
            label="Auto Reply"
            active={isActive("/bot")}
            onClick={() => handleNavClick("/bot")}
          />

          {/* Sub Section: Device & API */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Device & API
            </p>
            <NavItem
              icon={Smartphone}
              label="Status Device"
              active={isActive("/device")}
              onClick={() => handleNavClick("/device")}
            />
            <NavItem
              icon={Key}
              label="API Settings"
              active={isActive("/api")}
              onClick={() => handleNavClick("/api")}
            />
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold text-sm">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-500 truncate">admin@dashpro.io</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;