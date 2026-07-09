import { useState } from "react";

export default function ImageUploader({ onUpload, multiple = false, label = "Upload Gambar" }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "jakarta_events");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setPreviews((prev) => [...prev, ...uploadedUrls]);
    onUpload(multiple ? uploadedUrls : uploadedUrls[0]);
    setUploading(false);
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer block">
        {uploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Mengupload...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-600 font-medium mb-1">{label}</p>
            <p className="text-sm text-gray-400">Klik untuk pilih file atau drag & drop</p>
            <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP. Max: 5MB</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}