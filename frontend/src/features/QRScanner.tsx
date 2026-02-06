import React, { useState, useEffect } from "react";
import {
  Smartphone,
  RefreshCw,
  CheckCircle,
  Plus,
  Copy,
  X,
  LogOut,
  Trash2,
  Loader2,
  ChevronRight,
  Activity,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import toast, { Toaster } from 'react-hot-toast';

const UnifiedDeviceManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [scanStatus, setScanStatus] = useState("default");
  const [qrBase64, setQrBase64] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const MySwal = withReactContent(Swal);


const handleRelog = async (deviceId: string | number, deviceName: string) => {
  const result = await MySwal.fire({
    title: <p className="text-lg font-bold font-sans">Relog Device?</p>,
    text: `Sesi pada ${deviceName} akan di-reset. Anda perlu scan ulang.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    confirmButtonText: "Ya, Relog",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    const toastId = toast.loading(`Mereset sesi ${deviceName}...`);
    try {
      const response = await fetch(`http://localhost:3000/device/relog/${deviceId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Sesi direset! Menampilkan QR...", { id: toastId });

        // --- BAGIAN PENTING AGAR QR MUNCUL ---
        setName(deviceName); // Set nama untuk polling status
        setQrBase64(data.qrCode); // Isi state QR dengan data dari backend
        setScanStatus("scanning"); // Ubah status ke scanning (ini akan nampilkan gambar QR)
        setIsModalOpen(true); // Buka modalnya
        
        fetchAllDevices(); // Refresh list utama
      } else {
        toast.error(data.message || "Gagal relog", { id: toastId });
      }
    } catch (error) {
      toast.error("Koneksi server gagal", { id: toastId });
    }
  }
};

  const handleSync = async () => {
    setIsSyncing(true);

    // Membuat toast loading awal
    const toastId = toast.loading("Sedang menyinkronkan data...");

    try {
      const response = await fetch("http://localhost:3000/device/sync");
      const data = await response.json();

      if (data.success) {
        // Mengubah toast loading menjadi success
        toast.success("Sinkronisasi Berhasil!", { id: toastId });
        fetchAllDevices();
      } else {
        // Mengubah toast loading menjadi error dengan pesan dari server
        toast.error(`Gagal: ${data.message}`, { id: toastId });
      }
    } catch (error) {
      console.error("Sync Error:", error);
      // Mengubah toast loading menjadi error koneksi
      toast.error("Terjadi kesalahan koneksi ke server.", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };


  const handleLogoutDevice = async (deviceId: number | string, deviceName: string) => {
    const result = await MySwal.fire({
      title: <p className="text-lg font-bold">Logout Device?</p>,
      text: `Sesi WhatsApp pada ${deviceName} akan dihentikan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6", // Biru
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const toastId = toast.loading(`Memutuskan sesi ${deviceName}...`);
      try {
        // Pastikan endpoint backend kamu sesuai (misal: /device/logout/:id)
        const response = await fetch(`http://localhost:3000/device/logout/${deviceId}`, {
          method: "POST",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Berhasil Logout!", { id: toastId });
          fetchAllDevices(); // Refresh untuk melihat perubahan status
        } else {
          toast.error(data.message || "Gagal logout", { id: toastId });
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi.", { id: toastId });
      }
    }
  };

  const fetchAllDevices = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("http://localhost:3000/device/all");
      const data = await res.json();
      if (data.success) setDevices(data.devices);
    } catch (err) {
      toast.error("Gagal memuat daftar perangkat");
    } finally {
      setLoadingList(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!name) return toast.error("Isi nama perangkat dahulu");
    try {
      setScanStatus("loading");
      const res = await fetch("http://localhost:3000/device/add-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: name }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
        setScanStatus("default");
        return;
      }
      fetchAllDevices();
      setQrBase64(data.qrCode);
      setScanStatus("scanning");
    } catch (err) {
      toast.error("Server error");
      setScanStatus("default");
    }
  };

  const handleDeleteDevice = async (id: number, deviceName: string) => {
    const result = await MySwal.fire({
      title: "Hapus Device?",
      text: `Yakin ingin menghapus ${deviceName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      const toastId = toast.loading(`Menghapus ${deviceName}...`);

      try {
        // Pastikan URL mengarah ke ID yang benar
        const response = await fetch(`http://localhost:3000/device/delete/${id}`, {
          method: "POST",
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Berhasil dihapus!", { id: toastId });
          fetchAllDevices(); // Refresh list setelah hapus
        } else {
          toast.error(data.message, { id: toastId });
        }
      } catch (error) {
        toast.error("Koneksi gagal", { id: toastId });
      }
    }
  };

  useEffect(() => {
    fetchAllDevices();
    let interval: any;

    if (scanStatus === "scanning") {
      interval = setInterval(async () => {
        try {
          // 1. Cek status ke server (Gunakan endpoint All atau Status)
          const res = await fetch("http://localhost:3000/device/all");
          const data = await res.json();

          if (data.success) {
            // Cari apakah device yang sedang di-scan sudah "Connected"
            const found = data.devices.find(
              (d: any) =>
                (d.device_name === name || d.name === name) &&
                d.status.toLowerCase() === "connected",
            );

            if (found) {
              // BERHENTI POLLING
              clearInterval(interval);

              // 2. OTOMATIS SYNC (Hanya sekali saja saat baru connect)
              // Ini akan mengambil nomor HP dari StarSender ke DB Lokal
              await fetch("http://localhost:3000/device/sync");

              // 3. Update UI
              setScanStatus("connected");
              toast.success(`Device ${name} Terhubung & Disinkronkan!`);

              setTimeout(() => {
                setIsModalOpen(false);
                setScanStatus("default");
                setName("");
                fetchAllDevices(); // Refresh list terakhir untuk memunculkan nomor HP
              }, 2500);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000); // Cek setiap 5 detik
    }

    return () => clearInterval(interval);
  }, [scanStatus, name]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Key disalin`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors">
      <Toaster />

      {/* HEADER (Sesuai InboxView) */}
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700 dark:text-blue-500 flex items-center gap-2">
            Devices
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800">
              {devices.length} Active
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllDevices}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <RefreshCw
                size={18}
                className={
                  loadingList ? "animate-spin text-blue-700" : "text-slate-400"
                }
              />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Controls Area */}
      <div className="flex flex-col md:flex-row items-center gap-4">



        {/* Dropdown Device (Kode lama kamu) */}
        <div className="relative">
          {/* ... select device ... */}
        </div>

        {/* Filter Waktu (Kode lama kamu) */}
        <div className="flex bg-white dark:bg-slate-900/60 p-1 rounded-lg ...">
          {/* ... filter buttons ... */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* TOMBOL SYNC BARU */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`mb-5 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${isSyncing
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
            : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }`}
        >
          {isSyncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Activity size={14} />
          )}
          {isSyncing ? "Syncing..." : "Sync Devices"}
        </button>
        
        {/* LIST DEVICE (Flat Design) */}
        <div className="space-y-1">
          {loadingList ? (
            <div className="flex flex-col items-center py-20 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">
                Loading Devices...
              </p>
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="group flex flex-col md:flex-row md:items-center gap-4 p-4 -mx-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                {/* Icon & Name */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${device.status === "Connected"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      }`}
                  >
                    <Smartphone size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[15px] truncate">
                        {device.name}
                      </h3>
                      <div
                        className={`w-2 h-2 rounded-full ${device.status === "Connected" ? "bg-green-500" : "bg-slate-300"}`}
                      />
                    </div>
                    <p className="text-[12px] text-slate-500 font-mono">
                      {device.number || "Not Registered"}
                    </p>
                  </div>
                </div>

                {/* API Info */}
                <div className="flex flex-wrap items-center gap-4 md:px-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      API Key
                    </span>
                    <div className="flex items-center gap-1">
                      <code className="text-[10px] text-blue-600 font-mono bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        {device.apiKey?.substring(0, 8)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(device.apiKey)}
                        className="text-slate-300 hover:text-blue-700 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      Server
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic">
                      {device.server}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                   onClick={() => handleRelog(device.id, device.device_name)}
                    className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Relog"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id, device.name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight
                    size={18}
                    className="text-slate-200 group-hover:text-blue-700 transition-all"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL (Simple & Professional) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-md shadow-2xl overflow-hidden p-8 border border-slate-200 dark:border-slate-800 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">New Connection</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {scanStatus === "scanning" ? (
              <div className="text-center space-y-6 py-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 inline-block shadow-sm">
                  <img src={qrBase64} alt="QR" className="w-48 h-48" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-700" size={20} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Waiting for Scan...
                  </p>
                </div>
              </div>
            ) : scanStatus === "connected" ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h2 className="text-xl font-black">Connected!</h2>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Device Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS_Admin_1"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-3 outline-none focus:border-blue-700 transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGenerateQR}
                  disabled={scanStatus === "loading"}
                  className="w-full py-4 bg-blue-700 text-white rounded-md font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {scanStatus === "loading" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Generate QR Code"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDeviceManager;
