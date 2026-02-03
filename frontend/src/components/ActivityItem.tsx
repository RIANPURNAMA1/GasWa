import React from "react";

interface ActivityItemProps {
  icon: any;
  title: string;
  time: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon: Icon, title, time, color }) => (
  <div className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="text-xs text-slate-400">{time}</p>
    </div>
  </div>
);

export default ActivityItem;
