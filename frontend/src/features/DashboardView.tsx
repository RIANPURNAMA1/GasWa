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
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

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
      <div
        className={`${color} p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:scale-110 transition-transform`}
      >
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
    pesanMasukToday: 0,
    pesanKeluar: 0,
    totalDevice: 0,
    deviceConnected: 0,
    leadMasuk: 0,
    leadAktif: 0,
    slowResponse: 0,
    unanswered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);

  // Fungsi Fetch Data dari Backend
const fetchLiveMessages = async () => {
  try {
    // Tambahkan parameter device ke URL
    const url = new URL("http://localhost:3000/api/messages/all");
    if (selectedDevice !== "Semua Device") {
      url.searchParams.append("device", selectedDevice);
    }

    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (result.success) {
      const incomingOnly = result.data
        .filter((chat: any) => chat.is_me === 0 || chat.is_me === false) 
        .slice(0, 15);

      setMessages(incomingOnly);
    }
  } catch (error) {
    console.error("Gagal sinkronisasi chat:", error);
  }
};

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
// 1. HAPUS useEffect yang lama (yang ada interval 5000 dan array kosong [])
// 2. GANTI dengan ini:

useEffect(() => {
  // Panggil langsung saat filter berubah
  fetchLiveMessages();
  fetchStats();

  // Buat interval untuk Chat Feed (Cepat: 5 detik)
  const messageInterval = setInterval(() => {
    fetchLiveMessages();
  }, 5000);

  // Buat interval untuk Statistik Card (Lebih lambat: 30 detik agar hemat resource)
  const statsInterval = setInterval(() => {
    fetchStats();
  }, 30000);

  // Bersihkan KEDUA interval saat filter berubah atau pindah halaman
  return () => {
    clearInterval(messageInterval);
    clearInterval(statsInterval);
  };
}, [activeFilter, selectedDevice]); // <-- Ini kuncinya agar filter device langsung ngefek

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-widest text-xs">
            Menghubungkan ke Database...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 transition-colors duration-500">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-[0.3em] text-center"></h1>

        {/* Filter Controls Area */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Dropdown Device */}
          <div className="relative">
            <Smartphone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm min-w-[180px]"
            >
              <option>Semua Device</option>
              {deviceList.map((dev: any) => (
                <option key={dev.id} value={dev.name}>
                  {dev.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
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
        {/* Pesan Masuk Area (Main Card) - Sekarang Jadi Live Chat Feed */}
        <div className="md:col-span-2 md:row-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl min-h-[400px] flex flex-col shadow-sm">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Live Message Feed (Incoming Only)
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-400 dark:text-slate-300 uppercase font-bold tracking-tighter">
                  Device: {selectedDevice} • Active
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-4xl font-black text-blue-700 dark:text-blue-500 leading-none">
                {stats.pesanMasuk}
              </span>
              <span className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest">
                Total Pesan Masuk
              </span>
            </div>
          </div>

          {/* Chat Feed Area - Minimalist Empty Profile Version */}
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[350px] space-y-2 px-1">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500/50" size={24} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4">
                  Establishing Link...
                </span>
              </div>
            ) : messages.length > 0 ? (
              messages.map((chat, idx) => (
                <div
                  key={chat.id}
                  className="group relative flex gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-blue-500/5 border border-transparent hover:border-slate-100 dark:hover:border-blue-500/10 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Placeholder Profil Kosong - Minimalist Style */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                    <svg
                      className="w-5 h-5 text-slate-400 dark:text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                          {chat.sender}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-black uppercase tracking-tighter">
                          {chat.received_via}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">
                        {chat.received_at.split(" ")[1].substring(0, 5)}
                      </span>
                    </div>

                    <div className="relative">
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                        {chat.message_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center">
                  <MessageSquare size={20} className="text-slate-400" />
                </div>
                <p className="text-[9px] mt-4 font-black uppercase tracking-[0.4em]">
                  No Incoming Stream
                </p>
              </div>
            )}

            {/* Live Status Indicator - Ultra Minimalist */}
            {!loading && (
              <div className="sticky bottom-0 pt-6 pb-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Monitoring Live Database
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Auto-Sync Active • MySQL Live
            </p>
            <Link
              to="/inbox"
              className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline uppercase tracking-widest transition-all"
            >
              View All Inbox <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* --- GRID STATS --- */}

        {/* 1. Pesan Masuk Hari Ini - Logic baru: Selalu Real-time per hari ini */}
        <StatCard
          title="Pesan Masuk Hari Ini"
          value={stats.pesanMasukToday}
          subValue="Total Chat Hari Ini"
          icon={MessageSquare}
          color="text-blue-500"
        />

        {/* 2. Pesan Terkirim - Sesuai filter dropdown */}
        <StatCard
          title="Pesan Terkirim"
          value={stats.pesanKeluar}
          subValue="Output WhatsApp"
          icon={Send}
          color="text-orange-400"
        />

        {/* 3. Lead Masuk - Total customer unik berdasarkan filter waktu */}
        <StatCard
          title="Lead Masuk"
          value={stats.leadMasuk}
          subValue="Database Prospek"
          color="text-green-500"
          icon={Users}
        />

        {/* 4. Percakapan Berlangsung - Aktif 30 Menit Terakhir */}
        <StatCard
          title="Percakapan Berlangsung"
          value={stats.leadAktif}
          subValue="Aktif 30 Menit Terakhir"
          color="text-cyan-500"
          icon={() => (
            <div className="relative">
              <Activity size={18} />
              {stats.leadAktif > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>
          )}
        />

        {/* 5. Balasan Terlalu Lama - Peringatan > 10 menit */}
        <StatCard
          title="Balasan Terlalu Lama"
          value={stats.slowResponse}
          subValue="Response Time > 10m"
          color={
            stats.slowResponse > 0
              ? "text-red-500 animate-pulse"
              : "text-yellow-500"
          }
          icon={Clock}
        />

        {/* 6. Tak Terjawab - Peringatan Keras > 24 jam */}
        <StatCard
          title="Tak Terjawab"
          value={stats.unanswered}
          subValue="Belum dibalas > 24 Jam"
          color={
            stats.unanswered > 0 ? "text-red-600 font-bold" : "text-slate-400"
          }
          icon={AlertCircle}
        />

        {/* 7. Device Online - Status Hardware */}
        <StatCard
          title="Device Online"
          value={stats.deviceConnected}
          subValue={`Dari ${stats.totalDevice} Device`}
          icon={Smartphone}
          color="text-indigo-500"
        />

        {/* 8. Device Mati - Status Hardware Kritis */}
        <StatCard
          title="Device Mati"
          value={stats.totalDevice - stats.deviceConnected}
          subValue="Perlu scan ulang"
          color={
            stats.totalDevice - stats.deviceConnected > 0
              ? "text-red-600"
              : "text-slate-300"
          }
          icon={AlertCircle}
        />

        {/* 9. Status Antrian / Lead Aktif (Bisa digunakan untuk Device Status detail) */}
        <StatCard
          title="Status Koneksi"
          value={stats.deviceConnected > 0 ? "Stabil" : "Putus"}
          subValue="Network Engine"
          icon={CheckCircle}
          color={
            stats.deviceConnected > 0 ? "text-emerald-500" : "text-red-500"
          }
        />
      </div>
    </div>
  );
};

export default DashboardView;
