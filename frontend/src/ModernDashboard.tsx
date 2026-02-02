import { useState } from "react";
import {
  Activity,
  MessageSquare,
  Send,
  Users,
  UserPlus,
  Radio,
  Clock,
  Bot,
  Smartphone,
  Key,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  Bell,
  Menu,
  X,
  Link,
  ChevronRight,
  Zap,
  Target,
  Award,
  Eye,
  Heart,
  Share2,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

interface Transaction {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  time: string;
}

function ModernDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats: StatCard[] = [
    {
      title: "Total Revenue",
      value: "$124,563",
      change: 12.5,
      icon: DollarSign,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Active Users",
      value: "8,426",
      change: 8.2,
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Total Orders",
      value: "2,547",
      change: -3.1,
      icon: ShoppingCart,
      color: "from-orange-500 to-pink-600",
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: 5.7,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: "1",
      customer: "Sarah Johnson",
      product: "Premium Plan",
      amount: "$299",
      status: "completed",
      time: "2 min ago",
    },
    {
      id: "2",
      customer: "Michael Chen",
      product: "Starter Pack",
      amount: "$49",
      status: "pending",
      time: "15 min ago",
    },
    {
      id: "3",
      customer: "Emma Wilson",
      product: "Enterprise",
      amount: "$999",
      status: "completed",
      time: "1 hour ago",
    },
    {
      id: "4",
      customer: "James Rodriguez",
      product: "Pro Plan",
      amount: "$149",
      status: "failed",
      time: "2 hours ago",
    },
    {
      id: "5",
      customer: "Olivia Brown",
      product: "Basic",
      amount: "$29",
      status: "completed",
      time: "3 hours ago",
    },
  ];

  const quickActions = [
    { icon: Zap, label: "Quick Start", color: "bg-yellow-500" },
    { icon: Target, label: "Set Goal", color: "bg-purple-500" },
    { icon: Award, label: "Rewards", color: "bg-pink-500" },
    { icon: MessageSquare, label: "Support", color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
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
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem
              icon={Activity}
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <NavItem icon={MessageSquare} label="Inbox" badge="LIVE" onClick={() => setActiveTab("inbox")} />
            <NavItem icon={Send} label="Kirim Pesan" onClick={() => setActiveTab("send")} />
            <NavItem icon={Users} label="Kontak" onClick={() => setActiveTab("contacts")} />
            <NavItem icon={Radio} label="Broadcast" badge="PRO" onClick={() => setActiveTab("broadcast")} />
            <NavItem icon={Bot} label="Auto Reply" onClick={() => setActiveTab("bot")} />

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Device & API
              </p>
              <NavItem icon={Smartphone} label="Status Device" onClick={() => setActiveTab("device")} />
              <NavItem icon={Key} label="API Settings" onClick={() => setActiveTab("api")} />
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold">
                AD
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">admin@dashpro.io</p>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm placeholder-slate-500 w-32 md:w-48"
                />
              </div>
              <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-200 cursor-pointer">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-inherit/20`}>
                    <stat.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      stat.change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {stat.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`${action.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                <button className="text-sm text-violet-600 hover:underline font-medium">View All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {transaction.customer.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{transaction.customer}</p>
                        <p className="text-xs text-slate-500">{transaction.product}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold text-slate-900">{transaction.amount}</p>
                        <p className="text-xs text-slate-400">{transaction.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                        transaction.status === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-violet-600" />
                Activity Feed
              </h3>
              <div className="space-y-4">
                <ActivityItem icon={Eye} title="Page Views Increased" time="5m ago" color="bg-blue-50 text-blue-600" />
                <ActivityItem icon={Heart} title="New Subscriber" time="12m ago" color="bg-pink-50 text-pink-600" />
                <ActivityItem icon={MessageSquare} title="5 New Messages" time="30m ago" color="bg-violet-50 text-violet-600" />
                <ActivityItem icon={Award} title="Goal Achieved" time="2h ago" color="bg-yellow-50 text-yellow-600" />
              </div>
              <button className="w-full mt-6 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                Load More
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-components
function NavItem({ icon: Icon, label, active, badge, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ActivityItem({ icon: Icon, title, time, color }: any) {
  return (
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
}

export default ModernDashboard;