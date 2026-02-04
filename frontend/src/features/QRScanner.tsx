import React, { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  RefreshCw,
  CheckCircle,
  Plus,
  X,
  LogOut,
  Trash2,
  Info,
  RotateCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const UnifiedDeviceManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [scanStatus, setScanStatus] = useState("default");
  const [qrBase64, setQrBase64] = useState("");

  const [newDeviceKey, setNewDeviceKey] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

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
    if (!name) return alert("Nama device isi dulu");

    try {
      setScanStatus("loading");

      const res = await fetch("http://localhost:3000/device/add-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: name, // ⚠️ HARUS deviceName, bukan name
        }),
      });

      const data = await res.json();
      console.log("RESP BACKEND:", data);

      if (!data.success) {
        alert(data.message);
        setScanStatus("default");
        return;
      }

      // ✅ Ambil QR dari backend
      setQrBase64(data.qrCode);
      setScanStatus("scanning");
    } catch (err) {
      console.error(err);
      alert("Server error");
      setScanStatus("default");
    }
  };

 useEffect(() => {
  fetchAllDevices();
  let interval: any;

  if (scanStatus === "scanning") {
    interval = setInterval(async () => {
      try {
        // 1. Paksa backend sync dari StarSender ke Database kita
        await fetch("http://localhost:3000/device/sync");

        // 2. Ambil ulang semua data device terbaru dari database
        const res = await fetch("http://localhost:3000/device/all");
        const data = await res.json();

        if (data.success) {
          setDevices(data.devices);

          // 3. Cari device yang sedang di-scan
          // Gunakan toLowerCase() untuk menghindari error typo huruf besar
          const found = data.devices.find(
            (d: any) =>
              (d.device_name === name || d.name === name) && 
              d.status.toLowerCase() === "connected"
          );

          if (found) {
            console.log("Device ditemukan dan terhubung!");
            setScanStatus("connected"); // Ini akan merubah UI modal ke CheckCircle
            
            toast.success(`Device ${name} berhasil terhubung!`, {
              position: "top-center",
            });

            // Beri jeda 2 detik agar user bisa melihat icon sukses sebelum modal tutup
            setTimeout(() => {
              setIsModalOpen(false);
              setScanStatus("default");
              setName("");
              fetchAllDevices(); // Refresh list terakhir
            }, 2000);

            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling sync error:", err);
      }
    }, 5000); // Polling setiap 5 detik
  }

  return () => clearInterval(interval);
}, [scanStatus, name]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Disalin ke clipboard!`);
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900/40 min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            WhatsApp <span className="text-indigo-600">Manager</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">
            Manajemen multi-device dalam satu pintu.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAllDevices}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-white/5 hover:scale-105 transition-transform"
          >
            <RefreshCw
              size={20}
              className={loadingList ? "animate-spin text-indigo-500" : ""}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Device
          </button>
        </div>
      </div>

      {/* GRID DEVICE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loadingList
          ? [1, 2].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"
              />
            ))
          : devices.map((device) => (
              <div
                key={device.id}
                className="bg-white dark:bg-[#1e293b] rounded-2xl border dark:border-white/5 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md"
              >
                {/* SISI KIRI: INFO DEVICE */}
                <div className="p-6 flex-grow border-b md:border-b-0 md:border-r dark:border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          device.status === "Connected"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold dark:text-white text-lg flex items-center gap-2">
                          {device.name}
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full uppercase">
                            Multidevice
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {device.number}
                        </p>
                      </div>
                    </div>

                    {/* BADGE STATUS */}
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-tighter ${
                        device.status === "Connected"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {device.status === "Connected"
                        ? "Terkoneksi"
                        : "Tidak Terkoneksi"}
                    </span>
                  </div>

                  {/* API KEY SECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border dark:border-white/5">
                      <code className="text-[10px] text-indigo-400 truncate w-40 font-mono">
                        {device.apiKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(device.apiKey)} // Cukup satu argumen
                        className="text-[10px] font-bold bg-white dark:bg-slate-800 border dark:border-white/10 px-3 py-1 rounded shadow-sm hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Server ID: {device.server}
                    </div>
                  </div>
                </div>

                {/* SISI KANAN: ACTION BUTTONS */}
                {/* RIGHT: ACTIONS */}
                <div className="p-4 bg-slate-50/50 dark:bg-black/10 flex md:flex-col gap-2 min-w-[140px] justify-center">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pink-500 text-white rounded-lg text-xs font-bold hover:bg-pink-600 transition-all uppercase">
                    <RefreshCw size={14} /> Relog
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all uppercase">
                    <LogOut size={14} /> Logout
                  </button>

                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all uppercase">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* MODAL (Tetap rapi) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-md shadow-2xl relative overflow-hidden p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            {scanStatus === "scanning" ? (
              <div className="text-center space-y-6">
                <h2 className="text-xl font-bold dark:text-white">
                  Scan QR Code
                </h2>
                <div className="bg-white p-3 rounded-2xl border-4 border-slate-100 inline-block shadow-inner">
                  <img src={qrBase64} alt="QR" className="w-48 h-48" />
                </div>
                <p className="text-sm text-slate-500 animate-pulse">
                  Menunggu koneksi dari HP...
                </p>
              </div>
            ) : scanStatus === "connected" ? (
              <div className="text-center py-10">
                <CheckCircle
                  size={64}
                  className="text-green-500 mx-auto mb-4"
                />
                <h2 className="text-2xl font-black dark:text-white">Sukses!</h2>
                <p className="text-slate-500">Device {name} siap digunakan.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold dark:text-white text-center">
                  Tambah Device Baru
                </h2>
                <input
                  type="text"
                  placeholder="Nama Device (Contoh: Admin_1)"
                  className="w-full p-4 rounded-xl border dark:bg-slate-900 dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  onClick={handleGenerateQR}
                  disabled={scanStatus === "loading"}
                  className="w-full py-4 bg-indigo-600 text-white rounded-md font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {scanStatus === "loading"
                    ? "Generating..."
                    : "Generate QR Code"}
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
