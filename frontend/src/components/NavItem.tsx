import React from "react";

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </div>
    {badge && (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

export default NavItem;
