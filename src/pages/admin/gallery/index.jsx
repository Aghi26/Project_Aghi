import { useState, useEffect } from "react";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";

function AdminGallery() {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: "", alt: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setImages(list);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const resetForm = () => {
    setForm({ url: "", alt: "" });
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url) {
      toast.error("URL gambar harus diisi");
      return;
    }
    setSaving(true);
    try {
      const id = `gallery-${Date.now().toString(36)}`;
      await setDoc(doc(db, "gallery", id), {
        ...form,
        id,
        url: form.url,
        alt: form.alt || "",
        createdAt: new Date().toISOString(),
      });
      setImages((prev) => [...prev, { id, ...form, createdAt: new Date().toISOString() }]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving gallery image:", error);
      toast.error("Gagal menyimpan gambar: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus gambar "${item.alt || item.url}"?`)) return;
    try {
      await deleteDoc(doc(db, "gallery", item.id));
      setImages((prev) => prev.filter((img) => img.id !== item.id));
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast.error("Gagal menghapus gambar: " + error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "yjztwdcz";
      const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "jakarta_events";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Upload gagal");
      }

      const data = await res.json();
      setForm((f) => ({ ...f, url: data.secure_url }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload gambar: " + error.message);
    }
    setUploading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">🖼️ Galeri</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola gambar galeri event</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary inline-flex items-center gap-2"
          >
            ✨ Tambah Gambar
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f3f4f6'/><text x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='30'>🖼️</text></svg>";
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(img)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
                {img.alt && (
                  <div className="p-2">
                    <p className="text-xs text-gray-500 truncate">{img.alt}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🖼️</p>
              <p className="text-sm">Belum ada gambar — tambah gambar baru atau jalankan /seed-data</p>
            </div>
          )}
        </div>

        {/* Add Image Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl modal-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">✨ Tambah Gambar</h3>
                <button onClick={() => { resetForm(); setShowForm(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload from computer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload dari Komputer</label>
                  <label className={`flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    {uploading ? (
                      <span className="text-sm text-gray-500">⏳ Mengupload...</span>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl block mb-1">📤</span>
                        <span className="text-sm text-gray-500">Klik untuk upload gambar</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-400">atau masukkan URL</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                {form.url && (
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img src={form.url} alt="Preview" className="w-full h-32 object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={form.alt}
                    onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
                    placeholder="Contoh: Konsert BLACKPINK"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving || uploading} className="flex-1 btn-primary">
                    {saving ? "⏳..." : "✨ Tambah"}
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

export default withAdmin(AdminGallery);
