import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, RefreshCw, Search, ChevronDown, ArrowRight } from "lucide-react";
import LabelManager from "./LabelManager";

interface Message {
  id: number;
  device_key: string;
  received_via: string;
  sender: string;
  message_text: string;
  is_me: number;
  received_at: string;
}

interface Label {
  id: number;
  name: string;
}

interface Contact {
  phone: string;
  name: string;
}

const ProfessionalInbox: React.FC = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("Semua Device");
  // State ini sekarang menghandle Label DAN status "Belum di baca"
  const [selectedLabelFilter, setSelectedLabelFilter] = useState("Semua pesan masuk");
  const [isLoading, setIsLoading] = useState(true);
  
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [senderLabels, setSenderLabels] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resMsg, resLabels, resMap, resContacts] = await Promise.all([
        fetch("http://localhost:3000/api/messages/all"),
        fetch("http://localhost:3000/api/labels"),
        fetch("http://localhost:3000/api/labels/assignments"),
        fetch("http://localhost:3000/api/contacts")
      ]);

      if (resMsg.ok) setAllMessages((await resMsg.json()).data || []);
      if (resLabels.ok) setAvailableLabels((await resLabels.json()).data || []);
      if (resMap.ok) setSenderLabels((await resMap.json()).data || {});
      
      if (resContacts.ok) {
        const contactData = await resContacts.json();
        const contactMap: Record<string, string> = {};
        contactData.data.forEach((c: Contact) => {
          contactMap[c.phone] = c.name;
        });
        setContacts(contactMap);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getDisplayName = (phone: string) => {
    return contacts[phone] || phone;
  };

  const handleAssignLabel = async (sender: string, labelName: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/labels/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, label: labelName }),
      });
      if (res.ok) {
        setSenderLabels(prev => ({ ...prev, [sender]: labelName }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const chatList = useMemo(() => {
    const groups: Record<string, any> = {};

    const sortedMessages = [...allMessages].sort((a, b) => 
      new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
    );

    sortedMessages.forEach((msg) => {
      const key = `${msg.sender}_${msg.device_key}`;
      
      if (!groups[key]) {
        groups[key] = { ...msg, unreadCount: 0 };
      }

      groups[key].message_text = msg.message_text;
      groups[key].received_at = msg.received_at;
      groups[key].is_me = msg.is_me;

      // Logika unread: Jika pesan dari orang lain (is_me === 0), tambah count.
      // Jika kita membalas (is_me === 1), reset count (asumsi sudah dibaca).
      if (msg.is_me === 0) {
        groups[key].unreadCount += 1;
      } else {
        groups[key].unreadCount = 0;
      }

      groups[key].assignedLabel = senderLabels[msg.sender] || "Tanpa Label";
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }, [allMessages, senderLabels]);

  const filteredMessages = chatList.filter((m) => {
    const contactName = getDisplayName(m.sender).toLowerCase();
    const matchSearch = 
      contactName.includes(searchTerm.toLowerCase()) || 
      m.sender.includes(searchTerm) || 
      m.message_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDevice = selectedDevice === "Semua Device" || m.received_via === selectedDevice;
    
    // Logika Filter Label & Unread
    let matchLabel = true;
    if (selectedLabelFilter === "Belum di baca") {
      matchLabel = m.unreadCount > 0;
    } else if (selectedLabelFilter !== "Semua pesan masuk") {
      matchLabel = m.assignedLabel === selectedLabelFilter;
    }

    return matchSearch && matchDevice && matchLabel;
  });

  const uniqueDevices = useMemo(() => {
    const devices = allMessages.map((m) => m.received_via).filter(Boolean);
    return ["Semua Device", ...Array.from(new Set(devices))];
  }, [allMessages]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">Pesan Masuk</h1>
          <button onClick={fetchData} className="text-slate-400 hover:text-blue-700 transition-colors">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <LabelManager labels={availableLabels} onRefresh={fetchData} />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["Semua pesan masuk", "Belum di baca", "Tanpa Label", ...availableLabels.map(l => l.name)].map((lbl) => (
            <button
              key={lbl}
              onClick={() => setSelectedLabelFilter(lbl)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                selectedLabelFilter === lbl 
                ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                : "bg-transparent text-slate-400 border-slate-200 hover:border-slate-400"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Search & Device Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau pesan..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-sm focus:ring-2 ring-indigo-500/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 relative">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none appearance-none text-sm font-medium"
            >
              {uniqueDevices.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-1">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div key={`${msg.sender}_${msg.device_key}`} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-100 transition-all">
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden"
                    onClick={() => navigate("/chat", { state: { sender: msg.sender, deviceKey: msg.device_key } })}
                  >
                    <span className="text-indigo-600 font-bold text-lg">
                      {contacts[msg.sender] ? contacts[msg.sender].charAt(0).toUpperCase() : <User size={24} />}
                    </span>
                  </div>
                  {msg.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex flex-col">
                      <span className={`text-sm truncate ${msg.unreadCount > 0 ? "font-black" : "font-bold"}`}>
                        {getDisplayName(msg.sender)}
                      </span>
                      {contacts[msg.sender] && (
                        <span className="text-[10px] text-slate-400 font-medium">{msg.sender}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={senderLabels[msg.sender] || ""} 
                        onChange={(e) => handleAssignLabel(msg.sender, e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-blue-500 uppercase outline-none cursor-pointer"
                      >
                        <option value="">+ Label</option>
                        {availableLabels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                      </select>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-4 ${msg.unreadCount > 0 ? "text-slate-900 dark:text-white font-medium" : "text-slate-500"}`}>
                      {msg.message_text}
                    </p>
                    {msg.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-sm">
                        {msg.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">
                      DEVICE : {msg.received_via}
                    </span>
                    {senderLabels[msg.sender] && (
                      <span className="text-[8px] font-black text-white bg-green-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                        {senderLabels[msg.sender]}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight 
                  onClick={() => navigate("/chat", { state: { sender: msg.sender, deviceKey: msg.device_key } })} 
                  size={16} 
                  className="text-slate-200 group-hover:text-indigo-500 cursor-pointer transition-colors" 
                />
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm italic">
              Tidak ada pesan yang sesuai filter...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInbox;