import { useState, useEffect } from "react";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";

function AdminNews() {
  const toast = useToast();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Concert",
    date: "",
    konten: "",
    gambar: "",
  });

  const categories = ["Concert", "Comedy", "Theater", "Festival"];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const snap = await getDocs(collection(db, "news"));
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setNews(list);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  const resetForm = () => {
    setForm({ title: "", category: "Concert", date: "", konten: "", gambar: "" });
    setEditingNews(null);
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || "",
      category: item.category || "Concert",
      date: item.date || "",
      konten: item.konten || "",
      gambar: item.gambar || "",
    });
    setEditingNews(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.konten) {
      toast.error("Judul dan konten harus diisi");
      return;
    }
    setSaving(true);
    try {
      if (editingNews) {
        await updateDoc(doc(db, "news", editingNews.id), {
          ...form,
          updatedAt: new Date().toISOString(),
        });
        setNews((prev) =>
          prev.map((n) => (n.id === editingNews.id ? { ...n, ...form } : n))
        );
      } else {
        const id = `news-${Date.now().toString(36)}`;
        await setDoc(doc(db, "news", id), {
          ...form,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setNews((prev) => [{ id, ...form, createdAt: new Date().toISOString() }, ...prev]);
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error("Gagal menyimpan berita: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus berita "${item.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "news", item.id));
      setNews((prev) => prev.filter((n) => n.id !== item.id));
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Gagal menghapus berita: " + error.message);
    }
  };

  const filteredNews = news.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (n.title || "").toLowerCase().includes(q) ||
      (n.category || "").toLowerCase().includes(q) ||
      (n.konten || "").toLowerCase().includes(q)
    );
  });

  const categoryColors = {
    Concert: "bg-purple-100 text-purple-700",
    Comedy: "bg-yellow-100 text-yellow-700",
    Theater: "bg-blue-100 text-blue-700",
    Festival: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📰 News</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola berita dan artikel event</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary inline-flex items-center gap-2"
          >
            ✨ Tambah Berita
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* News List */}
        <div className="space-y-3">
          {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4 hover:shadow-md transition">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden hidden sm:block">
                  {item.gambar ? (
                    <img src={item.gambar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}>
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 truncate">{item.title}</h3>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">✏️</button>
                      <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.konten}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">{search ? `Tidak ada berita untuk "${search}"` : "Belum ada berita — tambah berita baru atau jalankan /seed-data"}</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl modal-content max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingNews ? "✏️ Edit Berita" : "✨ Tambah Berita"}
                </h3>
                <button onClick={() => { resetForm(); setShowForm(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="text" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      placeholder="Contoh: 15 Januari 2025"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea value={form.konten} onChange={(e) => setForm((f) => ({ ...f, konten: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input type="text" value={form.gambar} onChange={(e) => setForm((f) => ({ ...f, gambar: e.target.value }))}
                    placeholder="https://... atau /assets/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary">
                    {saving ? "⏳..." : editingNews ? "💾 Simpan" : "✨ Tambah"}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdmin(AdminNews);
