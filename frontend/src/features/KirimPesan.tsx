import React, { useState, useEffect } from "react";
import {
  Send,
  Image,
  FileText,
  User,
  MessageSquare,
  Info,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  time: string;
  isMe: boolean;
  from?: string;
}

const KirimPesan: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });

  // Handle auto-hide alert
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => setStatus({ type: null, msg: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: "" });

    const cleanPhone = phone.replace(/\s+/g, "").replace("+", "");

    try {
      const response = await fetch("http://localhost:3000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomorTujuan: cleanPhone, pesan: message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', msg: "Pesan berhasil dijadwalkan ke antrian." });
        setPhone("");
        setMessage("");
      } else {
        setStatus({ type: 'error', msg: data.error || "Gagal mengirim pesan. Cek koneksi API." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Server tidak merespon. Pastikan Backend aktif." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Enterprise</span>
              <div className="h-px w-8 bg-slate-300 dark:bg-slate-700"></div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kirim <span className="text-blue-600 dark:text-blue-400">Pesan Baru</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              Manajemen pengiriman pesan instan via Official API Gateway.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/40 p-2 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Connection Status</p>
              <p className="text-xs font-bold text-green-500">Encrypted & Secure</p>
            </div>
          </div>
        </div>

        {/* Alert Notification */}
        {status.type && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
            status.type === 'success' 
            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400" 
            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{status.msg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSend}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-md border border-slate-200 dark:border-white/10 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              {/* Input Nomor */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={14} className="text-blue-600" />
                  Penerima
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 62821xxx"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                  required
                />
              </div>

              {/* Input Pesan */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-600" />
                  Isi Pesan
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan profesional Anda di sini..."
                  rows={6}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-medium resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                  required
                ></textarea>
              </div>

              {/* Attachments Section */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-transparent">
                  <Image size={16} /> Sisipkan Gambar
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-transparent">
                  <FileText size={16} /> Lampirkan Dokumen
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-5 rounded-md shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
                    loading
                      ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400"
                      : "bg-blue-700 hover:bg-blue-700 text-white shadow-blue-500/40"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      MENGIRIM...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      KIRIM PESAN SEKARANG
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-md text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <MessageSquare size={150} />
              </div>
              <h3 className="font-black mb-4 flex items-center gap-2 text-lg uppercase tracking-tighter">
                <Info size={20} />
                Quick Guide
              </h3>
              <div className="space-y-4 relative z-10">
                {[
                  "Pastikan nomor tujuan menggunakan format internasional (628...).",
                  "Maksimal ukuran file lampiran adalah 10MB.",
                  "Pesan akan diproses dalam antrian server dalam < 2 detik."
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 text-sm text-blue-100 font-medium">
                    <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-md border border-slate-200 dark:border-white/10">
              <h3 className="font-black text-slate-400 mb-5 text-[10px] uppercase tracking-[0.2em]">
                API Integrity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Gateway Status</span>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KirimPesan;