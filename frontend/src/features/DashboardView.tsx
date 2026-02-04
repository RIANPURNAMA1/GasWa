import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Send,
  Clock,
  Activity,
  ChevronDown,
  Loader2
} from "lucide-react";

// --- Komponen Sub: Kartu Statistik ---
const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  color = "text-blue-400",
}: any) => (
  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-5 rounded-xl flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm group">
    <div className="flex justify-between items-start">
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
        {title}
      </h3>
      <div className={`${color} p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:scale-110 transition-transform`}>
        {Icon && <Icon size={18} />}
      </div>
    </div>
    <div className="mt-4">
      <div className="text-4xl font-light text-slate-900 dark:text-white">
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {subValue}
        </div>
      )}
    </div>
  </div>
);

const DashboardView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Hari ini");
  const [selectedDevice, setSelectedDevice] = useState("Semua Device");
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pesanMasuk: 0,
    pesanKeluar: 0,
    totalDevice: 0,
    deviceConnected: 0,
    percakapanAktif: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fungsi Fetch Stats & Devices
  const fetchStats = async () => {
    try {
      const url = new URL("http://localhost:3000/dashboard/stats");
      url.searchParams.append("filter", activeFilter);
      if (selectedDevice !== "Semua Device") {
        url.searchParams.append("device", selectedDevice);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        if (data.devices) setDeviceList(data.devices);
      }
    } catch (err) {
      console.error("Gagal load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto refresh 30 detik
    return () => clearInterval(interval);
  }, [activeFilter, selectedDevice]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-widest text-xs">Menghubungkan ke Database...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 transition-colors duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-[0.3em] text-center">
       
        </h1>

        {/* Filter Controls Area */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Dropdown Device */}
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm min-w-[180px]"
            >
              <option>Semua Device</option>
              {deviceList.map((dev: any) => (
                <option key={dev.id} value={dev.name}>{dev.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
          

          {/* Filter Waktu */}
          <div className="flex bg-white dark:bg-slate-900/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
            {["Hari ini", "Kemarin", "Minggu", "Bulan"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`px-4 py-1.5 rounded-md font-bold transition-all uppercase ${
                  activeFilter === item
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-blue-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
        
        {/* Pesan Masuk Area (Main Card) */}
        <div className="md:col-span-2 md:row-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl min-h-[350px] flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Total Pesan Masuk
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-white/20 animate-pulse"></div>
                <span className="text-[10px] text-slate-400 dark:text-slate-300 uppercase font-bold tracking-tighter">
                  Device: {selectedDevice}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-6xl font-extralight text-blue-600 dark:text-blue-400 leading-none">
                {stats.pesanMasuk}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">
                {activeFilter}
              </span>
            </div>
          </div>

          {/* Visualizer Dinamis */}
          <div className="flex-grow mt-6 flex items-end justify-between gap-1 border-t border-slate-100 dark:border-slate-800/50 pt-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-blue-500/20 rounded-t-sm hover:bg-blue-500/50 transition-all duration-500"
                style={{ height: `${Math.floor(Math.random() * 80) + 10}%` }}
              ></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 italic text-center uppercase tracking-[0.2em]">
            Auto-Sync Active • StarSender API
          </p>
        </div>

        {/* --- GRID STATS --- */}

        <StatCard
          title="Pesan Terkirim"
          value={stats.pesanKeluar}
          subValue="Output WhatsApp"
          icon={Send}
          color="text-orange-400"
        />

        <StatCard
          title="Device Online"
          value={stats.deviceConnected}
          subValue={`Dari ${stats.totalDevice} Device Terdaftar`}
          icon={Smartphone}
          color="text-indigo-500"
        />

        <StatCard
          title="Percakapan Aktif"
          value={stats.percakapanAktif}
          subValue="Interaksi Berlangsung"
          icon={MessageSquare}
          color="text-blue-400"
        />

        <StatCard
          title="Lead Masuk"
          value={stats.pesanMasuk}
          subValue="Database Prospek"
          color="text-green-500"
          icon={Users}
        />

        <StatCard
          title="Balasan Terlalu Lama"
          value={Math.floor(stats.pesanMasuk * 0.1)} // Dummy Logic
          subValue="Response Time > 10m"
          color="text-yellow-500"
          icon={Clock}
        />

        <StatCard
          title="Tak Terjawab"
          value={Math.floor(stats.pesanMasuk * 0.05)} // Dummy Logic
          subValue="Belum ada respon"
          color="text-red-400"

        />

        <StatCard
          title="Percakapan Berlangsung"
          value={stats.percakapanAktif}
          subValue="Live Chatting"
          color="text-cyan-500"
          icon={Activity}
        />

        <StatCard
          title="Device Mati"
          value={stats.totalDevice - stats.deviceConnected}
          subValue="Perlu scan ulang"
          color="text-red-600"
          icon={AlertCircle}
        />

        <StatCard
          title="Lead Aktif"
          value={stats.deviceConnected}
          subValue="Queue Status"
          icon={CheckCircle}
          color="text-emerald-500"
        />
      </div>
    </div>
  );
};

export default DashboardView;