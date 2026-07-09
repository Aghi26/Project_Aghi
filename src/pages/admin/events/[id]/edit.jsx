import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import AdminLayout from "@/pages/components/AdminLayout";
import EventForm from "@/pages/components/EventForm";
import withAdmin from "@/pages/components/withAdmin";

function EditEvent() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Gagal memuat data event");
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError("");

    try {
      const updateData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      // Hapus field id dari data update (id adalah document key)
      delete updateData.id;
      await updateDoc(doc(db, "events", id), updateData);
      setSuccess(true);
      setTimeout(() => router.push("/admin/events"), 1500);
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Gagal mengupdate event: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">Event dengan ID "{id}" tidak tersedia di Firestore</p>
          <button onClick={() => router.push("/admin/events")} className="btn-primary">← Kembali ke Daftar Event</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/events")} className="text-gray-400 hover:text-gray-600 transition">←</button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">✏️ Edit Event</h1>
              <p className="text-sm text-gray-500 mt-1">Mengedit: <span className="font-medium text-gray-700">{event.title}</span></p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Perubahan tersimpan di Firestore!</p>
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
          {!success && <EventForm initialData={event} onSubmit={handleSubmit} loading={saving} />}
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdmin(EditEvent);
