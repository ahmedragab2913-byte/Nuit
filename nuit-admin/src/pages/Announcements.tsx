import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, RefreshCw, Megaphone } from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import type { Announcement } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };

const parseAnnouncementText = (text: string) => {
  if (!text) return { en: "", ar: "" };
  if (text.includes(" || ")) {
    const parts = text.split(" || ");
    return {
      en: (parts[0] || "").trim(),
      ar: (parts[1] || "").trim(),
    };
  }
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (hasArabic) {
    return { en: "", ar: text.trim() };
  }
  return { en: text.trim(), ar: "" };
};

export default function Announcements() {
  const {
    announcements,
    announcementsLoading,
    announcementsError,
    fetchAnnouncements,
    addAnnouncement,
    editAnnouncement,
    removeAnnouncement,
    toggleAnnouncementActive,
  } = useAdminStore();

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Bilingual state fields
  const [textEn, setTextEn] = useState("");
  const [textAr, setTextAr] = useState("");
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTextEn("");
    setTextAr("");
    setPriority(0);
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    const { en, ar } = parseAnnouncementText(a.text);
    setTextEn(en);
    setTextAr(ar);
    setPriority(a.priority);
    setIsActive(a.is_active);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await removeAnnouncement(id);
    } catch {
      alert("Failed to delete announcement.");
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await toggleAnnouncementActive(a);
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textEn.trim()) {
      alert("English announcement text is required.");
      return;
    }
    setFormLoading(true);
    const combinedText = textAr.trim()
      ? `${textEn.trim()} || ${textAr.trim()}`
      : textEn.trim();

    try {
      if (editingId) {
        await editAnnouncement(editingId, {
          text: combinedText,
          priority,
          is_active: isActive,
        });
      } else {
        await addAnnouncement({
          text: combinedText,
          priority,
          is_active: isActive,
        });
      }
      setShowForm(false);
    } catch {
      alert("Failed to save announcement.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Storefront Ticker
          </h1>
          {/* <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">
            Maison Nuit · 
          </p> */}
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus size={12} />
          Add Announcement
        </button>
      </div>

      {/* Main Panel */}
      <div
        className="rounded-3xl border border-white/6 p-5 sm:p-6"
        style={{ background: "#0d0d0d" }}
      >
        {announcementsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <RefreshCw size={24} className="animate-spin text-white/30" />
            <span className="text-[11px] text-white/30 tracking-[0.15em] uppercase">
              Loading announcements...
            </span>
          </div>
        ) : announcementsError ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-white/40 text-xs mb-4">{announcementsError}</p>
            <button
              onClick={fetchAnnouncements}
              className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <Megaphone size={32} className="text-white/10 mb-4" />
            <p className="text-white/30 text-xs">
              No announcements yet. Create one to display on the storefront.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/25 uppercase text-[9px] tracking-wider select-none">
                  <th className="pb-3 px-4 font-medium">Text (English / Arabic)</th>
                  <th className="pb-3 px-4 font-medium text-center">Status</th>
                  <th className="pb-3 px-4 font-medium text-center">Priority</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {announcements.map((a) => {
                  const { en, ar } = parseAnnouncementText(a.text);
                  return (
                    <tr key={a.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4 text-white/70 font-light max-w-md">
                        <div className="space-y-1">
                          <p className="text-[13px] text-white/80">{en}</p>
                          {ar && (
                            <p className="text-xs text-white/40 font-serif" dir="rtl">
                              {ar}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(a)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium cursor-pointer transition-colors ${
                            a.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/4 text-white/40 border-white/8 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${a.is_active ? "bg-emerald-400" : "bg-white/30"}`}
                          />
                          {a.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center text-white/50 font-light">
                        {a.priority}
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/8 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/4">
              <h3 className="text-sm uppercase tracking-[0.15em] text-white/80" style={serif}>
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/30 hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  English Text
                </label>
                <textarea
                  required
                  rows={2}
                  value={textEn}
                  onChange={(e) => setTextEn(e.target.value)}
                  placeholder="E.g., Buy 2 Get 1 FREE Across the Entire Collection"
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Arabic Text (Optional)
                </label>
                <textarea
                  rows={2}
                  value={textAr}
                  onChange={(e) => setTextAr(e.target.value)}
                  placeholder="مثال: اشتري ٢ واحصل على ١ مجاناً على كامل التشكيلة"
                  dir="rtl"
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full resize-none text-right font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-[#d4a853] w-4 h-4 rounded border-white/10 bg-white/4 cursor-pointer"
                    />
                    Active Status
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading && <RefreshCw size={12} className="animate-spin text-black" />}
                  {editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
