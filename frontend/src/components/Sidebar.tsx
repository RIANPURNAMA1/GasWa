import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Activity,
  MessageSquare,
  Send,
  Users,
  Smartphone,
  ChevronDown,
  Instagram,
  Facebook,
  MessageCircle,
  LayoutGrid,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk mengontrol dropdown menu
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    wa: true, // Default terbuka
    ig: false,
    fb: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path: string): boolean => location.pathname === path;



const handleLogout = () => {
  Swal.fire({
    title: "Yakin mau logout?",
    text: "Kamu harus login lagi untuk mengakses dashboard",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb", // biru
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      Swal.fire({
        icon: "success",
        title: "Berhasil logout",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }
  });
};

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-72 bg-[#0f172a] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Satu<span className="text-blue-400">Pintu</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                PT Sukses Mendunia
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {/* Dashboard - Single Link */}
          <button
            onClick={() => handleNavClick("/")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/")
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity size={20} />
            <span className="text-sm font-medium">Dashboard Overview</span>
          </button>

          <div className="h-px bg-white/5 my-4 mx-2" />

          {/* GROUP: WA GATEWAY */}
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu("wa")}
              className="w-full flex items-center justify-between px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                WA Gateway
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${openMenus.wa ? "rotate-180" : ""}`}
              />
            </button>

            {openMenus.wa && (
              <div className="space-y-1 mt-1">
                <SubNavItem
                  icon={MessageSquare}
                  label="Inbox"
                  active={isActive("/inbox")}
                  onClick={() => handleNavClick("/inbox")}
                />
                <SubNavItem
                  icon={Send}
                  label="Kirim Pesan"
                  active={isActive("/send")}
                  onClick={() => handleNavClick("/send")}
                />
                <SubNavItem
                  icon={Smartphone}
                  label="Device Status"
                  active={isActive("/add-device")}
                  onClick={() => handleNavClick("/add-device")}
                />
                <SubNavItem
                  icon={Users}
                  label="Kontak WA"
                  active={isActive("/contacts")}
                  onClick={() => handleNavClick("/contacts")}
                />
              </div>
            )}
          </div>

          {/* GROUP: INSTAGRAM */}
          <div className="space-y-1 pt-2">
            <button
              onClick={() => toggleMenu("ig")}
              className="w-full flex items-center justify-between px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Instagram
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${openMenus.ig ? "rotate-180" : ""}`}
              />
            </button>

            {openMenus.ig && (
              <div className="space-y-1 mt-1">
                <SubNavItem
                  icon={Instagram}
                  label="Direct Message"
                  active={false}
                  onClick={() => {}}
                />
                <SubNavItem
                  icon={LayoutGrid}
                  label="Auto Comment"
                  active={false}
                  onClick={() => {}}
                />
              </div>
            )}
          </div>

          {/* GROUP: FACEBOOK */}
          <div className="space-y-1 pt-2">
            <button
              onClick={() => toggleMenu("fb")}
              className="w-full flex items-center justify-between px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Facebook
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${openMenus.fb ? "rotate-180" : ""}`}
              />
            </button>

            {openMenus.fb && (
              <div className="space-y-1 mt-1">
                <SubNavItem
                  icon={Facebook}
                  label="Messenger"
                  active={false}
                  onClick={() => {}}
                />
              </div>
            )}
          </div>
        </nav>

        {/* Footer Profile */}
        <div className="p-4 bg-slate-900/50 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                Admin Rian
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Premium Plan
              </p>
            </div>
            <button
            onClick={handleLogout}
              title="Logout"
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Internal SubNavItem Component
const SubNavItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all group ${
      active
        ? "bg-white/10 text-blue-400"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon
        size={18}
        className={
          active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
        }
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {badge && (
      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
        {badge}
      </span>
    )}
  </button>
);

export default Sidebar;
