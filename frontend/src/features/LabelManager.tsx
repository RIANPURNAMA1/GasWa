import React, { useState } from "react";
import { Plus, X, Tag, Trash2, Loader2 } from "lucide-react";

interface LabelManagerProps {
  labels: any[]; // Data object dari database [{id: 1, name: "Leads"}]
  onRefresh: () => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({ labels, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLabel.trim() }),
      });
      if (res.ok) {
        setNewLabel("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus label ini?")) return;
    try {
      await fetch(`http://localhost:3000/api/labels/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
      >
        <Plus size={14} /> Manage Categories
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Database Labels</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2">
                {labels.map((lbl) => (
                  <div key={lbl.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm font-medium">{lbl.name}</span>
                    <button onClick={() => handleDelete(lbl.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New label..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm outline-none"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 rounded-lg text-sm font-bold">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelManager;