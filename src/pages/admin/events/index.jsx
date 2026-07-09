import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";
import { getEventStatus } from "@/utils/eventStatus";

function AdminEvents() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const eventsList = [];
        eventsSnap.forEach((doc) => eventsList.push({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = [...events];
    if (filterStatus !== "all") result = result.filter((e) => e.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.title || "").toLowerCase().includes(q) ||
          (e.venue || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q) ||
          (e.category || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return result;
  }, [events, search, filterStatus]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleDelete = async (eventId) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus event: " + error.message);
    }
    setDeleting(false);
    setDeleteConfirm(null);
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

  const upcomingCount = events.filter((e) => getEventStatus(e) === "upcoming").length;
  const pastCount = events.filter((e) => getEventStatus(e) === "past").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total {events.length} event ({upcomingCount} akan datang, {pastCount} sudah lewat)
            </p>
          </div>
          <Link href="/admin/events/create" className="btn-primary inline-flex items-center gap-2">
            ✨ Tambah Event
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="all">Semua Status</option>
            <option value="upcoming">Akan Datang</option>
            <option value="past">Sudah Lewat</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Lokasi</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {event.image ? (
                              <img src={event.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🎪</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-400">ID: {event.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${event.category === "Concert" ? "badge-concert" : ""}
                          ${event.category === "Comedy" ? "badge-comedy" : ""}
                          ${event.category === "Theater" ? "badge-theater" : ""}
                          ${event.category === "Festival" ? "badge-festival" : ""}
                        `}>{event.category}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(event.date)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{event.venue}</p>
                        <p className="text-xs text-gray-400">{event.location}</p>
                      </td>
                      <td className="px-4 py-3">                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEventStatus(event) === "upcoming" ? "badge-upcoming" : "badge-past"}`}>
                          {getEventStatus(event) === "upcoming" ? "🟢 Akan Datang" : "🔴 Sudah Lewat"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/events/${event.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">✏️ Edit</Link>
                          <button onClick={() => setDeleteConfirm(event.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">🗑️ Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <p className="text-3xl mb-2">📭</p>
                      <p className="text-sm">{search ? `Tidak ada event untuk "${search}"` : "Belum ada event — jalankan /seed-data dulu"}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl modal-content">
              <div className="text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Event?</h3>
                <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition" disabled={deleting}>Batal</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition" disabled={deleting}>
                    {deleting ? "⏳..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdmin(AdminEvents);
