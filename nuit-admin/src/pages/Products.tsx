import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Search, Upload, Download, 
  X, AlertCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { getProductImage } from "../services/api"; // 🖼️ استيراد دالة معالجة الصور الذكية
import type { Product } from "../types";

const serif = { fontFamily: "'Playfair Display', serif" };
const ITEMS_PER_PAGE = 12;

export default function Products() {
  const getBilingualNames = (p: Product) => {
    let en = p.name || "";
    let ar = p.name_ar || "";
    if (en.includes(" || ")) {
      const parts = en.split(" || ");
      en = parts[0].trim();
      if (!ar) {
        ar = parts[1]?.trim() || "";
      }
    }
    return { en, ar };
  };

  const {
    products,
    productsLoading: loading,
    productsError: error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    categoryFilter,
    setProductsFilter,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    importProductExcel
  } = useAdminStore();

  const [search, setSearch] = useState(searchQuery);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = Number(searchParams.get("page")) || 1;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("Unisex");
  const [price, setPrice] = useState(1500);
  const [stock, setStock] = useState(50);
  const [size, setSize] = useState("100ml");
  const [tagline, setTagline] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setProductsFilter(search, categoryFilter);
    }, 400);
    return () => clearTimeout(handler);
  }, [search, categoryFilter, setProductsFilter]);

  useEffect(() => {
    setSearchParams({ page: "1" });
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchProducts(urlPage, ITEMS_PER_PAGE);
  }, [urlPage, searchQuery, categoryFilter]);

  const handlePageChange = (pageNumber: number) => {
    setSearchParams({ page: pageNumber.toString() });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setNameAr("");
    setCategory("Unisex");
    setPrice(1500);
    setStock(50);
    setSize("100ml");
    setTagline("");
    setDescriptionEn("");
    setDescriptionAr("");
    setNotesInput("");
    setFeatured(false);
    setPublished(true);
    setImageFile(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setNameAr(p.name_ar || "");
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setSize(p.size || "100ml");
    setTagline(p.tagline || "");
    
    let descEn = p.description || "";
    let descAr = p.description_ar || "";
    if (descEn.includes(" || ")) {
      const parts = descEn.split(" || ");
      descEn = parts[0].trim();
      if (!descAr) {
        descAr = parts[1]?.trim() || "";
      }
    }
    setDescriptionEn(descEn);
    setDescriptionAr(descAr);
    setNotesInput(Array.isArray(p.notes) ? p.notes.join(", ") : "");
    setFeatured(p.featured);
    setPublished(p.published);
    setImageFile(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this composition?")) return;
    try {
      await removeProduct(id);
      if (products.length === 1 && urlPage > 1) {
        handlePageChange(urlPage - 1);
      }
    } catch (err: unknown) {
      alert("Failed to delete product.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("name_ar", nameAr);
    formData.append("category", category);
    formData.append("price", String(price));
    formData.append("stock", String(stock));
    formData.append("size", size);
    formData.append("tagline", tagline);
    formData.append("description", `${descriptionEn.trim()} || ${descriptionAr.trim()}`);
    formData.append("description_ar", descriptionAr.trim());
    formData.append("featured", featured ? "1" : "0");
    formData.append("published", published ? "1" : "0");

    const notesArray = notesInput
      .split(",")
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (notesArray.length > 0) {
      notesArray.forEach((note) => {
        formData.append("notes[]", note);
      });
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingId) {
        await editProduct(editingId, formData);
      } else {
        await addProduct(formData);
      }
      setShowForm(false);
    } catch (err: any) {
      console.error("Save product failed:", err);
      setFormError(err.message || "Failed to save composition.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setImporting(true);
    setImportMsg(null);
    try {
      await importProductExcel(formData);
      setImportMsg("Import successful!");
    } catch (err: any) {
      console.error("Import failed:", err);
      setImportMsg(err.message || "Import failed. Please check the Excel file format.");
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const { exportProductsBlob } = await import("../services/api");
      const blob = await exportProductsBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      console.error("Export failed:", err);
      alert("Failed to export products.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Fragrance Formulation Catalog
          </h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:max-w-xl">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              placeholder="Search catalog compositions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setProductsFilter(search, e.target.value);
              setSearchParams({ page: "1" });
            }}
            className="bg-[#111111] border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 outline-none focus:border-[#d4a853]/40 transition-colors w-full sm:w-44 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Unisex">Unisex</option>
            <option value="Men Perfumes">Men</option>
            <option value="Women Perfumes">Women</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={12} />
            {importing ? "Importing..." : "Import Catalog"}
          </button>

          <button
            onClick={handleExport}
            className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download size={12} />
            Export Catalog
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus size={12} />
            Compose Scent
          </button>
        </div>
      </div>

      {/* Import Messages */}
      {importMsg && (
        <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-2xl p-4 text-xs text-white/70">
          <AlertCircle size={14} className="text-[#d4a853] flex-shrink-0" />
          <span>{importMsg}</span>
          <button 
            onClick={() => setImportMsg(null)} 
            className="ml-auto text-white/30 hover:text-white cursor-pointer bg-white/4 border border-white/8 p-1.5 rounded-xl transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Catalog Registry Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/4 rounded-3xl h-52" />
          ))}
        </div>
      ) : error ? (
        <div 
          className="rounded-3xl border border-white/6 p-10 text-center min-h-[300px] flex flex-col items-center justify-center"
          style={{ background: "#0d0d0d" }}
        >
          <p className="text-white/40 text-xs mb-4">{error}</p>
          <button 
            onClick={() => fetchProducts()} 
            className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div 
          className="rounded-3xl border border-white/6 p-10 text-center min-h-[300px] flex flex-col items-center justify-center"
          style={{ background: "#0d0d0d" }}
        >
          <p className="text-white/30 text-xs">No fragrances match the active catalog queries.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div 
            className="hidden md:block rounded-3xl border border-white/6 p-5 sm:p-6 overflow-hidden"
            style={{ background: "#0d0d0d" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/25 uppercase text-[9px] tracking-wider select-none">
                    <th className="pb-3 px-4 font-medium">Fragrance Composition</th>
                    <th className="pb-3 px-4 font-medium">Faceted Category</th>
                    <th className="pb-3 px-4 font-medium text-right">Price</th>
                    <th className="pb-3 px-4 font-medium text-right">Stock Level</th>
                    <th className="pb-3 px-4 font-medium text-center">Status</th>
                    <th className="pb-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-9 h-12 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/8">
                          {/* ✅ تعديل هنا: استخدام دالة معالجة رابط الصورة */}
                          <img 
                            src={getProductImage(p.image)} 
                            alt={p.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-perfume.jpg"; }}
                          />
                        </div>
                        <div>
                          {(() => {
                            const { en, ar } = getBilingualNames(p);
                            return (
                              <>
                                <h4 className="font-light text-white text-sm" style={serif}>{en}</h4>
                                {ar && <span className="text-[10px] text-white/35 font-serif" dir="rtl">{ar}</span>}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/65 font-light">
                        {p.category} · <span className="text-[10px] text-white/40">{p.size || "100ml"}</span>
                      </td>
                      <td className="py-4 px-4 text-right text-white/80 font-light font-mono">EGP {p.price}</td>
                      <td className="py-4 px-4 text-right text-white/80 font-light font-mono">{p.stock} units</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium ${
                          p.published 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-white/4 text-white/40 border-white/8"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.published ? "bg-emerald-400" : "bg-white/30"}`} />
                          {p.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
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
          </div>

          {/* Mobile Card Grid View */}
          <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div 
                key={p.id} 
                className="rounded-3xl border border-white/6 p-4 flex flex-col justify-between" 
                style={{ background: "#0d0d0d" }}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/8">
                    {/* ✅ تعديل هنا أيضاً: استخدام الدالة في كروت الموبايل */}
                    <img 
                      src={getProductImage(p.image)} 
                      alt={p.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-perfume.jpg"; }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider bg-white/4 border border-white/8 px-2 py-0.5 rounded-full text-white/60">
                      {p.category}
                    </span>
                    {(() => {
                      const { en, ar } = getBilingualNames(p);
                      return (
                        <>
                          <h4 className="font-light text-white text-sm" style={serif}>{en}</h4>
                          {ar && <p className="text-[10px] text-white/40 font-serif" dir="rtl">{ar}</p>}
                        </>
                      );
                    })()}
                    <p className="text-[10px] text-white/40">{p.size || "100ml"}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-wider">Price / Stock</p>
                    <p className="text-[11px] font-mono text-white/80">EGP {p.price} · <span className="font-sans text-[10px] text-white/55">{p.stock} units</span></p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium ${
                    p.published 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-white/4 text-white/40 border-white/8"
                  }`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer text-[10px] uppercase tracking-wider gap-1.5 font-medium"
                  >
                    <Edit size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer text-[10px] uppercase tracking-wider gap-1.5 font-medium"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/4 pt-4 text-xs">
              <div className="text-white/30 tracking-wide hidden sm:block">
                Showing <span className="text-white/60 font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="text-white/60 font-mono">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{" "}
                <span className="text-white/60 font-mono">{totalItems}</span> compositions
              </div>

              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-white/8 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[32px] h-8 text-[11px] tracking-wider rounded-xl border transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-[#d4a853] border-transparent text-black font-semibold"
                        : "border-white/8 text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-white/8 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scent Compose / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/8 w-full max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/4 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-[0.15em] text-white/80 font-medium" style={serif}>
                {editingId ? "Edit Fragrance Formulation" : "Compose Formulation"}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-white/30 hover:text-white p-2 rounded-xl bg-white/4 border border-white/8 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="px-6 pt-4">
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Scent Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Amber Night"
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Arabic Name (AR - Optional)</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: ليل العنبر"
                    dir="rtl"
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full text-right font-serif"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[#111111] border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men Perfumes">Men</option>
                    <option value="Women Perfumes">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Price (EGP)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Bottle Size</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="E.g., 100ml, 50ml"
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Slogan / Tagline (Optional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="E.g., Mysterious and warm amber"
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Description (EN)</label>
                  <textarea
                    required
                    rows={2}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Detailed fragrance characteristics, longevity details, notes evolution..."
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Description (AR - Optional)</label>
                  <textarea
                    rows={2}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="خصائص العطر وتفاصيل الثبات والتركيب..."
                    dir="rtl"
                    className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full resize-none text-right font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Fragrance Pyramid Notes (Comma-separated - Optional)</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Top Note, Heart Note, Base Note (E.g., Bergamot, Rose, Sandalwood)"
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>

              {/* ✅ إكمال الجزء المقطوع من الفورم وإضافة زر الحفظ وتغيير الصورة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">Composition Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-wider file:bg-white/5 file:text-white file:cursor-pointer hover:file:bg-white/10"
                  />
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-[#d4a853]"
                    />
                    <span className="text-[10px] uppercase tracking-wider text-white/60">Featured Scent</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="accent-[#d4a853]"
                    />
                    <span className="text-[10px] uppercase tracking-wider text-white/60">Publish Directly</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingId ? "Update Masterpiece" : "Launch Formulation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}