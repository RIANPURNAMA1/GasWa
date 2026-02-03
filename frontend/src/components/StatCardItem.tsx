import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

const StatCardItem: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => (
  <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-inherit/20`}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
      </div>
      <div
        className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}
      >
        {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        <span>{Math.abs(change)}%</span>
      </div>
    </div>
    <div>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default StatCardItem;
