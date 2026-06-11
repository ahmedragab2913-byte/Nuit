import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Search, Upload, Download, 
  RefreshCw, X, AlertCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import { getProductswithPagination, createProduct, updateProduct, deleteProduct, importProducts, exportProductsBlob } from "../services/api";
import type { Product } from "../types";

const serif = { fontFamily: "'Playfair Display', serif" };
const ITEMS_PER_PAGE = 12;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States الخاصة بالبحث (الأساسي والـ Debounced)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination States المتزامنة مع الـ URL
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Form State
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
  const [description, setDescription] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Excel Import State
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. تأثير الـ Debounce لمنع الـ Flooding وتصفير الصفحة عند البحث الجديد
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search.trim() !== "") {
        setSearchParams({ page: "1" });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [search, setSearchParams]);

  // 2. دالة جلب البيانات مع تمرير الـ Pagination والـ Search للسيرفر
  const fetchProductsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductswithPagination(currentPage, ITEMS_PER_PAGE, undefined, debouncedSearch);
      
      setProducts(response.data);
      setTotalPages(response.last_page);
      setTotalItems(response.total);
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setError("Failed to load products catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. إعادة الجلب عند تغيير رقم الصفحة أو انتهاء الـ Debounce للبحث
  useEffect(() => {
    fetchProductsList();
  }, [currentPage, debouncedSearch]);

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
    setDescription("");
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
    setDescription(p.description || "");
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
      await deleteProduct(id);
      if (products.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else {
        fetchProductsList();
      }
    } catch (err: any) {
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
    formData.append("description", description);
    formData.append("featured", featured ? "1" : "0");
    formData.append("published", published ? "1" : "0");

    // 🌟 تحديث إرسال الـ Notes عشان تتبعت كـ Array حقيقي يفهمه لارافيل natively
    const notesArray = notesInput
      .split(",")
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (notesArray.length > 0) {
      notesArray.forEach((note) => {
        formData.append("notes[]", note);
      });
    } // لو مفيش، مش بنعمل append خالص فـ لارافيل بيشوفها null وبتعدي الـ validation

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await createProduct(formData);
      }
      setShowForm(false);
      fetchProductsList();
    } catch (err: any) {
      console.error("Save product failed:", err);
      setFormError(err.response?.data?.message || "Failed to save composition.");
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
      await importProducts(formData);
      setImportMsg("Import successful!");
      fetchProductsList();
    } catch (err: any) {
      console.error("Import failed:", err);
      setImportMsg("Import failed. Please check the Excel file format.");
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportProductsBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export products.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-sm pl-9 pr-4 py-2 text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
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
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 rounded-sm px-4 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload size={12} />
            {importing ? "Importing..." : "Import"}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 rounded-sm px-4 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <Download size={12} />
            Export
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-white text-black hover:bg-white/90 rounded-sm px-5 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all cursor-pointer"
          >
            <Plus size={12} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Import Messages */}
      {importMsg && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-sm px-4 py-3 text-xs text-white/70">
          <AlertCircle size={14} className="text-primary" />
          <span>{importMsg}</span>
          <button onClick={() => setImportMsg(null)} className="ml-auto text-white/30 hover:text-white cursor-pointer"><X size={12} /></button>
        </div>
      )}

      {/* List / Table */}
      {loading ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw size={24} className="animate-spin text-white/30" />
          <span className="text-xs text-white/30 tracking-wider">Loading catalog...</span>
        </div>
      ) : error ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/40 text-xs mb-4">{error}</p>
          <button onClick={fetchProductsList} className="border border-white/10 hover:border-white/20 px-5 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white cursor-pointer">Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/30 text-xs">No fragrances match your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/5 rounded-md overflow-hidden flex flex-col justify-between">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/1 text-white/30 uppercase text-[9px] tracking-wider select-none">
                <th className="py-3 px-6 font-medium">Fragrance</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Price</th>
                <th className="py-3 px-4 font-medium text-right">Stock</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-12 bg-white/5 rounded-sm overflow-hidden flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-white/25">No Img</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-light text-white text-sm">{p.name}</h4>
                      {p.name_ar && <span className="text-[10px] text-white/30">{p.name_ar}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white/65 font-light">{p.category} · {p.size || "100ml"}</td>
                  <td className="py-4 px-4 text-right text-white/80 font-light">EGP {p.price}</td>
                  <td className="py-4 px-4 text-right text-white/80 font-light">{p.stock} units</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${
                      p.published 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    }`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="inline-flex items-center justify-center p-1.5 border border-white/5 hover:border-white/20 hover:text-white rounded-sm text-white/35 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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

          {/* شريط الـ Pagination المتوافق مع التصميم الراقي للوحة التحكم */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 py-4 px-6 text-xs bg-white/[0.01]">
              <div className="text-white/30 tracking-wide">
                Showing <span className="text-white/60">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="text-white/60">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{" "}
                <span className="text-white/60">{totalItems}</span> products
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-white/5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[28px] h-7 text-[11px] tracking-wider rounded-sm border transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-white/10 border-white/20 text-white font-medium"
                        : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-white/5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/5 w-full max-w-xl rounded-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wider text-white/70" style={serif}>
                {editingId ? "Edit Scent Accord" : "Compose New Accord"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="px-6 pt-4">
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-sm p-3.5 text-xs text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Scent Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Amber Night"
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Arabic Name (Optional)</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="الاسم بالعربية"
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3 py-2.5 text-xs text-white/60 outline-none focus:border-white/25 transition-all"
                  >
                    <option value="Unisex" className="bg-[#0c0c0c] text-white">Unisex</option>
                    <option value="Men" className="bg-[#0c0c0c] text-white">Men</option>
                    <option value="Women" className="bg-[#0c0c0c] text-white">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Price (EGP)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Stock (Units)</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Bottle Size</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="E.g., 100ml, 50ml"
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
                <div>
                  {/* 🌟 تم حذف required من هنا */}
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Slogan / Tagline (Optional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="E.g., Mysterious and warm amber"
                    className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed fragrance characteristics, longevity details, notes evolution..."
                  className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all resize-none"
                />
              </div>

              <div>
                {/* 🌟 تم حذف required من هنا */}
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Fragrance Pyramid Notes (Comma-separated - Optional)</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Top Note, Heart Note, Base Note (E.g., Bergamot, Rose, Sandalwood)"
                  className="w-full bg-white/4 border border-white/8 rounded-sm px-3.5 py-2.5 text-xs text-white/70 outline-none focus:border-white/25 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Image File (Scent Portrait)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-white/10 file:text-white file:hover:bg-white/15 file:cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-6 justify-end">
                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-primary rounded-sm cursor-pointer"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="accent-primary rounded-sm cursor-pointer"
                    />
                    Publish
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