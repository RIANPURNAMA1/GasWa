import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  MoreVertical, 
  ExternalLink, 
  Loader2, 
  X,
  ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- Komponen Sub: Baris Kontak (Flat Style) ---
const ContactItem = ({ name, phone, status, initials }: any) => (
  <div className="group flex items-center justify-between p-4 -mx-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
    <div className="flex items-center gap-4">
      {/* Avatar Bulat (Disesuaikan dengan tema Blue-700) */}
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm uppercase border border-blue-100 dark:border-blue-800/50">
        {initials || name.charAt(0)}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{phone}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
            status === 'Online' 
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
        className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        title="Chat WhatsApp"
      >
        <MessageCircle size={18} />
      </button>
      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
        <MoreVertical size={18} />
      </button>
      <ChevronRight size={18} className="text-slate-300 ml-2" />
    </div>
  </div>
);

const ContactsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", status: "Offline" });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchContacts(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
        toast.success("Kontak disimpan");
        setIsModalOpen(false);
        setNewContact({ name: "", phone: "", status: "Offline" });
        fetchContacts();
      }
    } catch (err) {
      toast.error("Error server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors">
      <Toaster />
      
      {/* HEADER (Sticky & Identik) */}
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-700 dark:text-blue-500 flex items-center gap-2">
              Contacts
            </h1>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-100 dark:border-slate-800">
               <div className="text-center">
                  <span className="block text-[11px] font-black text-blue-700">{stats.total}</span>
                  <span className="block text-[8px] uppercase tracking-tighter text-slate-400 font-bold">Total</span>
               </div>
               <div className="text-center">
                  <span className="block text-[11px] font-black text-green-500">{stats.online}</span>
                  <span className="block text-[8px] uppercase tracking-tighter text-slate-400 font-bold">Online</span>
               </div>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-700 text-white p-2.5 rounded-full hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 active:scale-95"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Minimalist Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-blue-700 transition-all text-sm font-medium"
          />
        </div>

        {/* Contacts List */}
        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-700" size={32} />
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact: any) => (
              <ContactItem key={contact.id} {...contact} />
            ))
          ) : (
            <div className="text-center py-24">
              <Users className="mx-auto text-slate-100 dark:text-slate-800 mb-4" size={64} />
              <p className="text-slate-400 font-medium italic">No contacts found</p>
            </div>
          )}
        </div>

        {/* Minimalist Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">MySQL Live Sync Active</p>
           <button className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1 uppercase tracking-widest">
             Export CSV <ExternalLink size={12} />
           </button>
        </footer>
      </div>

      {/* MODAL (Tambah Kontak) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-md shadow-2xl overflow-hidden p-10 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight">Add Contact</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-2 outline-none focus:border-blue-700 transition-all font-bold"
                  placeholder="e.g. John Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  required
                  type="number" 
                  className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-2 outline-none focus:border-blue-700 transition-all font-bold"
                  placeholder="62812..."
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-700 text-white rounded-md font-bold shadow-xl shadow-blue-700/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Save Contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsView;