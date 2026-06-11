import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, RefreshCw, Megaphone } from "lucide-react";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../services/api";
import type { Announcement } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setItems(data);
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setText("");
    setPriority(0);
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setText(a.text);
    setPriority(a.priority);
    setIsActive(a.is_active);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await updateAnnouncement(a.id, { is_active: !a.is_active });
      setItems((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, is_active: !item.is_active } : item))
      );
    } catch {
      alert("Failed to update.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setFormLoading(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, { text, priority, is_active: isActive });
      } else {
        await createAnnouncement({ text, priority, is_active: isActive });
      }
      setShowForm(false);
      fetchList();
    } catch {
      alert("Failed to save.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone size={18} className="text-white/40" />
          <h2 className="text-sm uppercase tracking-wider text-white/70" style={serif}>
            Announcements
          </h2>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-white text-black hover:bg-white/90 rounded-sm px-5 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all cursor-pointer"
        >
          <Plus size={12} />
          Add Announcement
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw size={24} className="animate-spin text-white/30" />
          <span className="text-xs text-white/30 tracking-wider">Loading announcements...</span>
        </div>
      ) : error ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/40 text-xs mb-4">{error}</p>
          <button onClick={fetchList} className="border border-white/10 hover:border-white/20 px-5 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white cursor-pointer">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <Megaphone size={32} className="text-white/10 mb-4" />
          <p className="text-white/30 text-xs">No announcements yet. Create one to display on the storefront.</p>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/5 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/1 text-white/30 uppercase text-[9px] tracking-wider select-none">
                <th className="py-3 px-6 font-medium">Text</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium text-center">Priority</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="py-4 px-6 text-white/70 font-light max-w-sm truncate">{a.text}</td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggleActive(a)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border cursor-pointer transition-colors ${
                        a.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20"
                      }`}
                    >
                      {a.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center text-white/50 font-light">{a.priority}</td>
                  <td className="py-4 px-6 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="inline-flex items-center justify-center p-1.5 border border-white/5 hover:border-white/20 hover:text-white rounded-sm text-white/35 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center justify-center p-1.5 border border-white/5 hover:border-red-500/20 hover:text-red-400 rounded-sm text-white/35 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/5 w-full max-w-md rounded-md overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wider text-white/70" style={serif}>
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Announcement Text</label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="E.g., Buy 2 Get 1 FREE Across the Entire Collection"
                  className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-primary rounded-sm cursor-pointer"
                    />
                    Active
                  </label>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/1 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-white/10 hover:border-white/25 text-white/60 hover:text-white rounded-sm px-5 py-2 text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="bg-white text-black hover:bg-white/90 rounded-sm px-6 py-2 text-[10px] uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {formLoading && <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                {editingId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
