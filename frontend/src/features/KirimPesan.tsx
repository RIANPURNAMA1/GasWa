import React, { useState, useEffect } from "react";
import { Send, User, MessageSquare, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const KirimPesan: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });

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

    const cleanPhone = phone.replace(/\D/g, "");

    try {
      const response = await fetch("http://localhost:3000/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: cleanPhone, message: message }),
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: "Pesan berhasil dikirim." });
        setPhone("");
        setMessage("");
      } else {
        const data = await response.json();
        setStatus({ type: 'error', msg: data.error || "Gagal mengirim." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Server tidak merespon." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header (Sama dengan InboxView) */}
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700 dark:text-blue-500 flex items-center gap-2">
            Compose
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800">
              New
            </span>
          </h1>
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={18} className="animate-spin text-blue-700" />}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Status Alert */}
        {status.type && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${
            status.type === 'success' 
            ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
            : "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-bold">{status.msg}</p>
          </div>
        )}

        {/* Form Minimalis (Tanpa Card Berat) */}
        <form onSubmit={handleSend} className="space-y-10">
          
          {/* Field: Nomor */}
          <div className="relative group">
            <div className="flex items-center gap-3 mb-2">
              <User size={16} className="text-slate-400 group-focus-within:text-blue-700 transition-colors" />
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Penerima</label>
            </div>
            <input
              type="text"
              placeholder="628123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-all text-lg font-medium"
              required
            />
          </div>

          {/* Field: Pesan */}
          <div className="relative group">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare size={16} className="text-slate-400 group-focus-within:text-blue-700 transition-colors" />
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Isi Pesan</label>
            </div>
            <textarea
              placeholder="Tulis sesuatu..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 outline-none focus:border-blue-700 dark:focus:border-blue-500 transition-all text-base font-medium resize-none"
              required
            />
          </div>

          {/* Tombol Kirim */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all active:scale-95 ${
                loading 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-700/20"
              }`}
            >
              <Send size={18} />
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </div>
        </form>

        <footer className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-8 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.3em]">
            Official API Gateway System
          </p>
        </footer>
      </div>
    </div>
  );
};

export default KirimPesan;