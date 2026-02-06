import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, User, MoreVertical } from "lucide-react";

const ChatView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const senderNumber = location.state?.sender || "";
  const initialDeviceKey = location.state?.deviceKey || "";

  const fetchHistory = async () => {
    if (!senderNumber || !initialDeviceKey) return;
    try {
      const res = await fetch(`http://localhost:3000/api/messages/all`);
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;

        const filtered = data.filter(
          (m: any) =>
            String(m.sender) === String(senderNumber) &&
            String(m.device_key) === String(initialDeviceKey),
        );

        setHistory(filtered.sort((a: any, b: any) => a.id - b.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [senderNumber, initialDeviceKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  // Ganti fungsi handleSend yang lama dengan ini
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: senderNumber, // Sesuai destrukturisasi BE: const { to, ... }
          message: input, // Sesuai destrukturisasi BE: const { message, ... }
          deviceKey: initialDeviceKey, // Sesuai destrukturisasi BE: const { deviceKey, ... }
        }),
      });

      if (res.ok) {
        setInput("");
        fetchHistory(); // Refresh history setelah kirim
      } else {
        const errorData = await res.json();
        console.error("Gagal kirim:", errorData.message);
      }
    } catch (err) {
      console.error("Gagal kirim karena masalah koneksi");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#efeae2] dark:bg-[#0b141a] transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between p-3 bg-white dark:bg-[#202c33] border-b dark:border-white/5 shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {senderNumber}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Device: {initialDeviceKey.substring(0, 8)}...
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-500 dark:text-gray-400">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Chat Area dengan Background Pattern */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 relative custom-scrollbar">
        {/* Dekorasi Background WhatsApp (Opsional) */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none "></div>

        <div className="relative z-10 space-y-3">
          {history.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_me === 1 ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative px-3 py-1.5 rounded-lg max-w-[80%] shadow-sm transition-all ${
                  msg.is_me === 1
                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-800 dark:text-gray-100 rounded-tr-none"
                    : "bg-white dark:bg-[#202c33] text-gray-800 dark:text-gray-100 rounded-tl-none"
                }`}
              >
                <p className="text-[14px] leading-relaxed">
                  {msg.message_text}
                </p>
                <div className="flex justify-end mt-1">
                  <span className="text-[9px] opacity-60 dark:opacity-50 italic">
                    {new Date(msg.received_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Footer */}
      <footer className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t dark:border-white/5 transition-colors">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-full px-4 py-1.5 shadow-sm border border-gray-200 dark:border-transparent">
            <input
              className="flex-1 bg-transparent border-none py-1.5 text-sm outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ketik pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white rounded-full transition-all active:scale-90 disabled:opacity-50"
          >
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatView;
