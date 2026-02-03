import React from "react";

interface QuickActionProps {
  icon: any;
  label: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionProps> = ({ icon: Icon, label, color }) => (
  <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-300 group">
    <div className={`${color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
  </button>
);

export default QuickActionButton;
