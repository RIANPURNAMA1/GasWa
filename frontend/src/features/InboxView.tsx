import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  User,
  Inbox,
  ArrowRight,
  Smartphone,
  RefreshCw,
  Search,
} from "lucide-react";

interface Message {
  id: number;
  device_key: string;
  received_via: string; // Nama device dari backend (d.device_name)
  sender: string;
  message_text: string;
  is_me: number;
  received_at: string;
}

const ProfessionalInbox: React.FC = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/messages/all");
      if (res.ok) {
        const result = await res.json();
        const data: Message[] = result.data || result;
        setAllMessages(data);
      }
    } catch (err) {
      console.error("Gagal ambil pesan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  // LOGIKA GROUPING MULTI-DEVICE
  const chatList = useMemo(() => {
    const groups: Record<string, Message> = {};

    // Sort ID terkecil ke terbesar agar pesan terakhir yang menimpa
    const sortedByID = [...allMessages].sort((a, b) => a.id - b.id);

    sortedByID.forEach((msg) => {
      // KUNCI UNIK: Nomor Pengirim + Device Key
      // Ini mencegah chat dari device berbeda bercampur jadi satu baris
      const groupKey = `${msg.sender}_${msg.device_key}`;
      groups[groupKey] = msg;
    });

    return Object.values(groups).sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }, [allMessages]);

  const handleOpenChat = (msg: Message) => {
    navigate("/chat", {
      state: {
        sender: msg.sender,
        deviceKey: msg.device_key, // Kirim device_key spesifik
      },
    });
  };

  const filteredMessages = chatList.filter(
    (m) =>
      m.sender.includes(searchTerm) ||
      m.message_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] font-sans antialiased text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Inbox</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Multi-Device Messenger System
            </p>
          </div>
          <button
            onClick={() => { setIsLoading(true); fetchMessages(); }}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin text-blue-500" : "text-slate-500"} />
          </button>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari nomor atau pesan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {filteredMessages.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMessages.map((msg) => (
                <div
                  key={`${msg.sender}_${msg.device_key}`}
                  onClick={() => handleOpenChat(msg)}
                  className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <User size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[15px] truncate">{msg.sender}</h3>
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                      {msg.is_me === 1 && <span className="text-indigo-500">Anda: </span>}
                      {msg.message_text}
                    </p>

                    <div className="flex">
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20 uppercase">
                        <Smartphone size={10} />
                        Receiver: {msg.received_via || "Unknown Device"}
                      </span>
                    </div>
                  </div>
                  
                  <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">Tidak ada pesan.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInbox;