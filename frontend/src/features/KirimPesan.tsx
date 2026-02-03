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
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:3000/all");
        if (res.ok) {
          const data = await res.json();
          setAllMessages(data);
        }
      } catch (err) {
        console.error("Gagal fetch pesan:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = phone.replace(/\s+/g, "").replace("+", "");

    try {
      const response = await fetch("http://localhost:3000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorTujuan: cleanPhone,
          pesan: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ Berhasil: " + data.message);
        setPhone("");
        setMessage("");
      } else {
        alert("❌ Gagal: " + (data.error || "Cek terminal backend!"));
      }
    } catch (error) {
      alert("❌ Server tidak merespon!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Compose <span className="text-blue-600">Message</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Kirim pesan WhatsApp terintegrasi via API Gateway.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={16} />
          Secure Connection
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSend}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
          >
            {/* Input Nomor */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                <User size={18} />
                Nomor Tujuan
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 6282118364415"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                required
                disabled={loading}
              />
              <p className="mt-2 text-[11px] text-slate-400 font-medium">
                *Pastikan menggunakan kode negara (62) tanpa spasi atau +.
              </p>
            </div>

            {/* Input Pesan */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                <MessageSquare size={18} />
                Konten Pesan
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan yang ingin Anda kirim..."
                rows={5}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium resize-none"
                required
                disabled={loading}
              ></textarea>
            </div>

            {/* Attachments & Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <Image size={18} /> Media
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <FileText size={18} /> File
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
                  loading
                    ? "bg-slate-200 cursor-not-allowed text-slate-400"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Memproses Antrian...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Kirim Sekarang
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info & Status Area */}
        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <Info size={20} />
              Panduan Cepat
            </h3>
            <ul className="text-sm text-blue-100 space-y-3 list-disc pl-4">
              <li>Pastikan server Node.js sudah menyala di port 3000.</li>
              <li>Pesan akan tercatat otomatis di database MySQL.</li>
              <li>Gunakan nomor aktif untuk testing API.</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">
              Server Status
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600">MySQL Connection</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KirimPesan;