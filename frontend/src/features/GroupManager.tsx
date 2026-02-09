import React, { useState, useEffect } from "react";
import { Users2, Search, RefreshCw, Send, Copy } from "lucide-react";

interface Group {
  id: string; // JID Grup
  name: string;
  participants_count: number;
}

const GroupManager: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // Endpoint simulasi berdasarkan dokumentasi Starsender
      const response = await fetch("http://localhost:3000/api/groups/list");
      const result = await response.json();
      setGroups(result.data || []);
    } catch (err) {
      console.error("Gagal mengambil grup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white dark:bg-[#0f172a] min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Grup WhatsApp</h1>
          <p className="text-sm text-slate-500">Kelola dan kirim pesan massal ke grup</p>
        </div>
        <button 
          onClick={fetchGroups}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Sync Grup
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari nama grup..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <div key={group.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Users2 size={24} />
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(group.id)}
                className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                title="Salin JID"
              >
                <Copy size={16} />
              </button>
            </div>
            
            <h3 className="font-bold text-lg mb-1 truncate">{group.name}</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">{group.id}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400">
                {group.participants_count} Peserta
              </span>
              <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider hover:gap-2 transition-all">
                Blast Ke Grup <Send size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupManager;