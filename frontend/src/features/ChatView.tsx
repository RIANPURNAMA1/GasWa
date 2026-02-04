import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, User, ChevronLeft, Clock, MoreVertical, ShieldCheck } from "lucide-react";

interface Message {
  id: number;
  text: string;
  time: string;
  isMe: boolean;
  from?: string;
}

const ChatView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const senderNumber = location.state?.replyTo || "";

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!senderNumber) return navigate("/inbox");

    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:3000/all");
        if (res.ok) {
          const allData: Message[] = await res.json();
          const filtered = allData.filter(m => m.from?.includes(senderNumber));
          const sorted = filtered.sort((a, b) => a.id - b.id); 
          setHistory(sorted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [senderNumber, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomorTujuan: senderNumber, pesan: input }),
      });
      
      if (res.ok) {
        setInput("");
      }
    } catch (err) {
      alert("Gagal kirim pesan");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5e7eb] dark:bg-[#0f172a] overflow-hidden relative">
      
      {/* Background Pattern Overlay (WhatsApp Style) */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url('https://p6.itc.cn/images01/20210323/46909405d45d40019253f53ca055375c.png')`, backgroundSize: '400px' }}>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b dark:border-white/5 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1e293b] rounded-full"></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{senderNumber}</h3>
            <div className="flex items-center gap-1">
              <span className="flex w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">Aktif Berjalan</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <ShieldCheck size={18} className="text-indigo-500 opacity-50 hidden sm:block" />
           <MoreVertical className="text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* Area Chat */}
      <div className="flex-1 overflow-y-auto p-4 md:px-8 space-y-4 z-10 custom-scrollbar">
        {/* Notif Enkripsi */}
        <div className="flex justify-center mb-6">
          <p className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] px-4 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/30 text-center max-w-xs shadow-sm">
            Pesan dienkripsi secara aman. Tidak ada pihak ketiga yang dapat membaca percakapan ini.
          </p>
        </div>

        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`relative max-w-[85%] md:max-w-[70%] px-3.5 py-2 shadow-sm ${
              msg.isMe 
              ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none" 
              : "bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-white dark:border-white/5"
            }`}>
              <p className="leading-relaxed text-[13.5px] font-medium">{msg.text}</p>
              <div className={`text-[9px] mt-1.5 flex justify-end items-center gap-1 font-bold ${msg.isMe ? "text-indigo-100" : "text-slate-400"}`}>
                {msg.time}
                {msg.isMe && <span className="text-[11px] leading-none ml-0.5">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Field (WhatsApp Style) */}
      <div className="p-4 bg-transparent z-20">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white dark:bg-[#1e293b] rounded-2xl px-4 py-1 shadow-md border dark:border-white/5">
            <input 
              type="text"
              placeholder="Ketik pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none py-3 text-sm focus:ring-0 text-slate-800 dark:text-white outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg transition-all active:scale-90 hover:shadow-indigo-500/30 group"
          >
            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;