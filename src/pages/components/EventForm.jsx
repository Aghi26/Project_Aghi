import { useState } from "react";
import ImageUploader from "./ImageUploader";

const CATEGORIES = ["Concert", "Comedy", "Theater", "Festival"];
const STATUSES = [
  { value: "upcoming", label: "Akan Datang" },
  { value: "past", label: "Sudah Lewat" },
];

export default function EventForm({ initialData = null, onSubmit, loading = false }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Concert",
    date: initialData?.date || "",
    endDate: initialData?.endDate || "",
    time: initialData?.time || "",
    venue: initialData?.venue || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    image: initialData?.image || "",
    adminPhone: initialData?.adminPhone || "6281234567890",
    status: initialData?.status || "upcoming",
    photographerAvailable: initialData?.photographerAvailable ?? false,
    photographerPrice: initialData?.photographerPrice || 0,
    photosAvailable: initialData?.photosAvailable ?? false,
    photoPrice: initialData?.photoPrice || 0,
    gallery: initialData?.gallery || [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Judul event wajib diisi";
    if (!form.date) newErrors.date = "Tanggal event wajib diisi";
    if (!form.time.trim()) newErrors.time = "Waktu event wajib diisi";
    if (!form.venue.trim()) newErrors.venue = "Venue wajib diisi";
    if (!form.location.trim()) newErrors.location = "Lokasi wajib diisi";
    if (!form.description.trim()) newErrors.description = "Deskripsi wajib diisi";
    if (form.photographerAvailable && !form.photographerPrice) {
      newErrors.photographerPrice = "Harga fotografer wajib diisi";
    }
    if (form.photosAvailable && !form.photoPrice) {
      newErrors.photoPrice = "Harga foto wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const handleImageUpload = (url) => {
    handleChange("image", url);
  };

  const handleGalleryUpload = (urls) => {
    handleChange("gallery", [...form.gallery, ...urls]);
  };

  const removeGalleryImage = (index) => {
    handleChange(
      "gallery",
      form.gallery.filter((_, i) => i !== index)
    );
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informasi Dasar */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Informasi Dasar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Judul Event *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={inputClass("title")}
              placeholder="Masukkan judul event"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={inputClass("category")}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className={inputClass("status")}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Waktu & Tempat */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Waktu & Tempat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tanggal Mulai *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={inputClass("date")}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className={labelClass}>Tanggal Selesai</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className={inputClass("endDate")}
              placeholder="Kosongkan jika 1 hari"
            />
          </div>
          <div>
            <label className={labelClass}>Waktu *</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className={inputClass("time")}
            />
            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
          </div>
          <div>
            <label className={labelClass}>Venue *</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              className={inputClass("venue")}
              placeholder="Nama venue / tempat"
            />
            {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
          </div>
          <div>
            <label className={labelClass}>Lokasi *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={inputClass("location")}
              placeholder="Contoh: Jakarta Selatan"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className={labelClass}>No. WhatsApp Admin</label>
            <input
              type="text"
              value={form.adminPhone}
              onChange={(e) => handleChange("adminPhone", e.target.value)}
              className={inputClass("adminPhone")}
              placeholder="6281234567890"
            />
          </div>
        </div>
      </section>

      {/* Deskripsi */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Deskripsi
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Deskripsi Singkat</label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => handleChange("shortDescription", e.target.value)}
              className={inputClass("shortDescription")}
              placeholder="Deskripsi singkat untuk card event"
            />
          </div>
          <div>
            <label className={labelClass}>Deskripsi Lengkap *</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass("description")} min-h-[120px] resize-y`}
              placeholder="Deskripsi lengkap event..."
              rows={5}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Harga & Status */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Harga & Layanan
        </h3>
        <div className="space-y-4">
          {/* Fotografer */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.photographerAvailable}
                onChange={(e) => handleChange("photographerAvailable", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Tersedia Sewa Fotografer
              </span>
            </label>
            {form.photographerAvailable && (
              <div className="mt-3 ml-7">
                <label className={labelClass}>Harga Sewa Fotografer (Rp)</label>
                <input
                  type="number"
                  value={form.photographerPrice}
                  onChange={(e) => handleChange("photographerPrice", Number(e.target.value))}
                  className={inputClass("photographerPrice")}
                  placeholder="500000"
                />
                {errors.photographerPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.photographerPrice}</p>
                )}
              </div>
            )}
          </div>

          {/* Foto */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.photosAvailable}
                onChange={(e) => handleChange("photosAvailable", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Tersedia Pembelian Foto
              </span>
            </label>
            {form.photosAvailable && (
              <div className="mt-3 ml-7">
                <label className={labelClass}>Harga per Foto (Rp)</label>
                <input
                  type="number"
                  value={form.photoPrice}
                  onChange={(e) => handleChange("photoPrice", Number(e.target.value))}
                  className={inputClass("photoPrice")}
                  placeholder="25000"
                />
                {errors.photoPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.photoPrice}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gambar */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Gambar
        </h3>
        <div className="space-y-6">
          {/* Thumbnail */}
          <div>
            <label className={labelClass}>Thumbnail Event</label>
            {form.image && (
              <div className="mb-3 relative inline-block group">
                <img
                  src={form.image}
                  alt="Thumbnail preview"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => handleChange("image", "")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            )}
            <ImageUploader onUpload={handleImageUpload} label="Upload Thumbnail" />
          </div>

          {/* Galeri */}
          <div>
            <label className={labelClass}>Galeri Foto Event</label>
            {form.gallery.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {form.gallery.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader
              onUpload={handleGalleryUpload}
              multiple
              label="Upload Gambar Galeri"
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          )}
          {isEdit ? "💾 Simpan Perubahan" : "✨ Buat Event"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
