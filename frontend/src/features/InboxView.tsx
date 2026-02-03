import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  User, 
  MessageSquare,
  ShieldCheck
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

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:3000/all");
      if (res.ok) {
        const data: Message[] = await res.json();
        // Hanya ambil yang bukan 'isMe'
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

  const filteredMessages = allMessages.filter((msg) =>
    (msg.from || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-widest uppercase mb-2">
              <ShieldCheck size={18} />
              <span>Security Verified</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Incoming <span className="text-slate-400 font-light">Logs</span>
            </h1>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-500">Total Entries</p>
            <p className="text-2xl font-mono font-bold text-indigo-600">{filteredMessages.length}</p>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by sender or content..."
              className="w-full bg-transparent border-none py-3 pl-12 pr-4 focus:ring-0 text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition text-sm font-medium">
            <Filter size={16} /> Filter
          </button>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
            Export JSON
          </button>
        </div>

        {/* Messaging Area - Minimalist Row Design */}
        <div className="space-y-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Sender Profile */}
                  <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <User size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Sender ID</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{msg.from || "Private"}</p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 border-l border-slate-100 md:pl-6">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageSquare size={14} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Payload</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {msg.text}
                    </p>
                  </div>

                  {/* Meta & Actions */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2 md:w-1/6 shrink-0">
                    <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                      <Clock size={14} />
                      <span className="text-xs font-mono font-medium">{msg.time.split(' ')[1]}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-800 transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No records found matching your criteria</p>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default ProfessionalInbox;