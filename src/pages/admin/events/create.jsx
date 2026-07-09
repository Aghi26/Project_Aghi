import { useState } from "react";
import { useRouter } from "next/router";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import AdminLayout from "@/pages/components/AdminLayout";
import EventForm from "@/pages/components/EventForm";
import withAdmin from "@/pages/components/withAdmin";

function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const generateId = (title) => {
    let id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    // Add timestamp suffix for uniqueness
    id = `${id}-${Date.now().toString(36)}`;
    return id;
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const id = generateId(formData.title);
      const newEvent = {
        ...formData,
        gallery: formData.gallery || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Hapus field yang tidak perlu disimpan di data dokumen
      delete newEvent.id;

      await setDoc(doc(db, "events", id), newEvent);
      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/events");
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Gagal membuat event: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">✨ Buat Event Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Isi form di bawah untuk menambahkan event baru ke portal</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Event berhasil dibuat & tersimpan di Firestore!</p>
              <p className="text-sm text-green-600">Mengalihkan ke daftar event...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          {!success && <EventForm onSubmit={handleSubmit} loading={loading} />}
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdmin(CreateEvent);
