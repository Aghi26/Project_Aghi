import { useState, useEffect } from "react";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";

function AdminPackages() {
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", price: 0, description: "", duration: "", photos: 0, isActive: true, sortOrder: 1,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packagesSnap = await getDocs(collection(db, "packages"));
        const list = [];
        packagesSnap.forEach((p) => list.push({ id: p.id, ...p.data() }));
        list.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
        setPackages(list);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const resetForm = () => {
    setForm({ name: "", price: 0, description: "", duration: "", photos: 0, isActive: true, sortOrder: packages.length + 1 });
    setEditingPackage(null);
  };

  const handleEdit = (pkg) => {
    setForm({
      name: pkg.name || "",
      price: pkg.price || 0,
      description: pkg.description || "",
      duration: pkg.duration || "",
      photos: pkg.photos || 0,
      isActive: pkg.isActive ?? true,
      sortOrder: pkg.sortOrder || 1,
    });
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPackage) {
        await updateDoc(doc(db, "packages", editingPackage.id), {
          ...form,
          updatedAt: new Date().toISOString(),
        });
        setPackages((prev) =>
          prev.map((p) => (p.id === editingPackage.id ? { ...p, ...form } : p))
        );
      } else {
        const id = `pkg-${Date.now().toString(36)}`;
        await setDoc(doc(db, "packages", id), {
          ...form,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setPackages((prev) => [...prev, { id, ...form }]);
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Gagal menyimpan paket: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "packages", id));
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Gagal menghapus paket: " + error.message);
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await updateDoc(doc(db, "packages", id), { isActive: !currentActive });
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    } catch (error) {
      console.error("Error toggling package:", error);
    }
  };

  const formatPrice = (price) => `Rp${(price || 0).toLocaleString()}`;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎫 Paket Fotografer</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola paket layanan fotografer untuk event</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">✨ Tambah Paket</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`bg-white rounded-xl shadow-sm border p-5 transition ${pkg.isActive ? "border-gray-100 hover:shadow-md" : "border-gray-200 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                  {!pkg.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Nonaktif</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(pkg)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">✏️</button>
                  <button onClick={() => toggleActive(pkg.id, pkg.isActive)}
                    className={`p-1.5 rounded-lg transition ${pkg.isActive ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}>
                    {pkg.isActive ? "🚫" : "✅"}
                  </button>
                  <button onClick={() => { if (window.confirm(`Hapus paket "${pkg.name}"?`)) handleDelete(pkg.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">🗑️</button>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-3">{formatPrice(pkg.price)}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><span className="text-gray-400">⏱️</span><span>{pkg.duration}</span></p>
                <p className="flex items-center gap-2"><span className="text-gray-400">📸</span><span>{pkg.photos} foto edit</span></p>
                <p className="text-gray-500 text-xs mt-2">{pkg.description}</p>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🎫</p>
              <p className="text-sm">Belum ada paket — jalankan /seed-data dulu</p>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl modal-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{editingPackage ? "✏️ Edit Paket" : "✨ Tambah Paket"}</h3>
                <button onClick={() => { resetForm(); setShowForm(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                    <input type="text" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Foto</label>
                    <input type="number" value={form.photos} onChange={(e) => setForm((p) => ({ ...p, photos: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Paket Aktif</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary">
                    {saving ? "⏳..." : editingPackage ? "💾 Simpan" : "✨ Tambah"}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdmin(AdminPackages);
