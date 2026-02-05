import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  RefreshCw, 
  LogOut, 
  Zap, 
  ShieldCheck,
  QrCode,
  Globe
} from "lucide-react";

const DeviceStatus: React.FC = () => {
  const [status, setStatus] = useState({
    isConnected: true,
    deviceName: "Samsung Galaxy S23 Ultra",
    platform: "WhatsApp Business",
    battery: 85,
    lastSeen: "Baru saja",
    phoneNumber: "+62 812-3456-7890",
    sessionName: "Server_Utama_01"
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000); // Simulasi refresh
  };

  

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Status <span className="text-indigo-600 dark:text-indigo-400">Perangkat</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Pantau stabilitas koneksi gateway SatuPintu Anda.
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-white/10 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Status Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border dark:border-white/5 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
              {/* Dekorasi Background */}
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe size={120} className="text-indigo-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    status.isConnected ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                  }`}>
                    <Smartphone size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{status.deviceName}</h2>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {status.isConnected ? 'Terhubung ke Gateway' : 'Terputus'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Terdaftar</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{status.phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{status.platform}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi Aktif</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{status.sessionName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baterai Perangkat</p>
                    <div className="flex items-center gap-2">
                      <Battery size={20} className={status.battery < 20 ? 'text-red-500' : 'text-green-500'} />
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{status.battery}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info Area */}
            <div className="bg-indigo-600 rounded-[1.5rem] p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Keamanan Sesi Terjamin</h3>
                  <p className="text-xs text-indigo-100 opacity-80">Enkripsi SatuPintu menjaga kunci API tetap aman.</p>
                </div>
              </div>
              <Zap size={24} className="opacity-50 animate-pulse" />
            </div>
          </div>

          {/* Side Info / Actions */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 border dark:border-white/5 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informasi Tambahan</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b dark:border-white/5">
                  <span className="text-sm text-slate-500">Status Server</span>
                  <span className="text-sm font-bold text-green-500">Normal</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b dark:border-white/5">
                  <span className="text-sm text-slate-500">Kualitas Signal</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-indigo-500 rounded-full"></div>)}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Versi Sistem</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">v2.0.4-Stable</span>
                </div>
              </div>
            </div>

            {/* Logout/Disconnect Button */}
            <button className="w-full group flex items-center justify-center gap-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-[1.5rem] transition-all duration-300 font-bold border border-red-200 dark:border-red-500/20">
              <LogOut size={20} />
              Putuskan Sesi
            </button>
            
            <p className="text-[10px] text-center text-slate-400 px-4 leading-relaxed font-medium">
              *Memutuskan sesi akan menghentikan seluruh pengiriman pesan otomatis dan bot secara instan.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeviceStatus;