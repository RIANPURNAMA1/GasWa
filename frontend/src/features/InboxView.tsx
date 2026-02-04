import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Eye,
  Filter,
  Clock,
  User,
  ShieldCheck,
  Inbox,
  ArrowRightCircle,
  Download,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  time: string;
  isMe: boolean;
  from?: string;
}

const ProfessionalInbox: React.FC = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:3000/all");
      if (res.ok) {
        const data: Message[] = await res.json();
        // Hanya ambil pesan masuk untuk ditampilkan di Inbox
        setAllMessages(data.filter((msg: Message) => !msg.isMe));
      }
    } catch (err) {
      console.error("Gagal ambil pesan:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChat = (phoneNumber: string) => {
    // Bersihkan nomor dari karakter non-digit
    const cleanNumber = phoneNumber.split("@")[0].replace(/\D/g, "");

    // Arahkan ke route chat/balas (sesuaikan path dengan route di App.tsx Anda)
    navigate("/chat", { state: { replyTo: cleanNumber } });
  };

  const deleteLog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Mencegah navigasi terbuka saat klik hapus
    if (window.confirm("Hapus log pesan ini?")) {
      // Tambahkan logic fetch DELETE di sini jika diperlukan
      setAllMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMessages = allMessages.filter(
    (msg) =>
      (msg.from || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.text.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 transition-colors duration-500 min-h-screen bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-[0.2em] uppercase mb-2">
              <ShieldCheck size={14} />
              <span>Security Verified Gateway</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kotak{" "}
              <span className="text-blue-600 dark:text-blue-400">Masuk</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Klik pada pesan untuk melihat riwayat percakapan lengkap.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-md border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                Total Pesan
              </p>
              <p className="text-2xl font-black text-blue-600 dark:text-green-400 leading-none">
                {filteredMessages.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Inbox size={20} />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-md p-2 mb-8 flex flex-wrap items-center gap-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="relative flex-1 min-w-[280px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari pengirim atau isi pesan..."
              className="w-full bg-transparent border-none py-3 pl-12 pr-4 focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition text-xs font-bold uppercase tracking-wider">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-500/30 uppercase tracking-widest">
            <Download size={16} /> Export
          </button>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenChat(msg.from || "")} // KLIK PADA CARD UNTUK KE CHAT
                className="group cursor-pointer relative bg-white dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-md p-5 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:bg-slate-800/40 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Sender Info */}
                  <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-blue-500/10 border border-slate-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform">
                      <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                        Pengirim
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                        {msg.from || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 md:border-l border-slate-100 dark:border-white/5 md:pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded uppercase tracking-tighter">
                        Text Message
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      {msg.text}
                    </p>
                  </div>

                  {/* Meta & Interactive Actions */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 md:w-1/5 shrink-0 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <Clock size={14} />
                      <span className="text-xs font-bold font-mono">
                        {msg.time.includes(" ")
                          ? msg.time.split(" ")[1]
                          : msg.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(msg.from || "");
                        }}
                        title="Lihat Detail"
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(msg.from || "");
                        }}
                        title="Balas Pesan"
                        className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl transition-all"
                      >
                        <ArrowRightCircle size={18} />
                      </button>
                      <button
                        onClick={(e) => deleteLog(e, msg.id)}
                        title="Hapus Log"
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem]">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Inbox
                  size={40}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tidak Ada Pesan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Belum ada log pesan masuk yang terdeteksi sistem.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInbox;
