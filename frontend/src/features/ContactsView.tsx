import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  MoreVertical, 
  ExternalLink, 
  Loader2, 
  X 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- Komponen Sub: Baris Kontak Satuan ---
const ContactItem = ({ name, phone, status, initials }: any) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group shadow-sm">
    <div className="flex items-center gap-4">
      {/* Avatar Bulat dengan Inisial */}
      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg uppercase">
        {initials || "???"}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{name}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">{phone}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            status === 'Online' 
            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <button 
        onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      >
        <MessageCircle size={18} />
      </button>
      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  </div>
);

// --- Komponen Utama: ContactsView ---
const ContactsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  
  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", status: "Offline" });
  const [submitting, setSubmitting] = useState(false);

  // Ambil data dari Backend
  const fetchContacts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/contacts?search=${encodeURIComponent(searchTerm)}`);
      const result = await response.json();
      if (result.success) {
        setContacts(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Gagal mengambil kontak:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search (Fetch hanya saat user berhenti mengetik)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handler Simpan Data
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Kontak berhasil ditambahkan!");
        setIsModalOpen(false);
        setNewContact({ name: "", phone: "", status: "Offline" });
        fetchContacts(); // Refresh list otomatis
      } else {
        toast.error(data.message || "Gagal menyimpan kontak");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 transition-colors duration-500">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header Bagian Atas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-blue-500" /> Daftar Kontak
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Production Environment • <span className="text-green-500 font-medium italic">MySQL Live Sync</span>
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus size={18} /> Tambah Kontak
          </button>
        </div>

        {/* Search Bar & Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau nomor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all shadow-sm"
            />
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-around shadow-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">Total</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{stats.online}</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">Online</div>
            </div>
          </div>
        </div>

        {/* Modal Popup: Tambah Kontak */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold dark:text-white">Tambah Kontak Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <form onSubmit={handleAddContact} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: Admin Rian"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nomor WhatsApp</label>
                  <input 
                    required
                    type="number" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="628123456789"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Status Awal</label>
                  <select 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none transition-all cursor-pointer"
                    value={newContact.status}
                    onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : "Simpan Kontak"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bagian List Kontak */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Database Logs
            </h3>
            {loading && <Loader2 size={14} className="animate-spin text-blue-500" />}
          </div>
          
          <div className="min-h-[400px]">
            {contacts.length > 0 ? (
              contacts.map((contact: any) => (
                <div key={contact.id} className="mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <ContactItem {...contact} />
                </div>
              ))
            ) : !loading && (
              <div className="text-center py-20 bg-white dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Data kontak tidak ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau tambah kontak baru</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Sederhana */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-medium uppercase tracking-widest">
          <span>Server: Node.js • MySQL</span>
          <div className="flex gap-4">
            <span className="hover:text-blue-500 cursor-pointer flex items-center gap-1 transition-colors">
              Download CSV <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsView;