import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/pages/components/AdminLayout";
import StatsCard from "@/pages/components/StatsCard";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";
import { getEventStatus, canBeliFoto } from "@/utils/eventStatus";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const events = [];
        eventsSnap.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));

        const upcoming = events.filter((e) => getEventStatus(e) === "upcoming");
        const past = events.filter((e) => getEventStatus(e) === "past");
        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          pastEvents: past.length,
        });

        setUpcomingEvents(
          upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
        );
        setPastEvents(
          past.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang di panel admin Jakarta Events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard icon="📋" value={stats.totalEvents} label="Total Events" color="blue" />
          <StatsCard icon="🟢" value={stats.upcomingEvents} label="Akan Datang" color="green" />
          <StatsCard icon="🔴" value={stats.pastEvents} label="Sudah Lewat" color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Mendatang */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">📅 Event Mendatang</h2>
              <Link href="/admin/events" className="text-sm text-blue-600 font-medium hover:underline">
                Lihat Semua →
              </Link>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}/edit`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = "🎪"; }}
                        />
                      ) : "🎪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)} • {event.venue}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {getEventStatus(event) === "upcoming" ? "Akan Datang" : "Sudah Lewat"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada event mendatang</p>
            )}
          </div>

          {/* Event Sudah Lewat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">📸 Event Sudah Lewat</h2>
              <Link href="/admin/events" className="text-sm text-blue-600 font-medium hover:underline">
                Lihat Semua →
              </Link>
            </div>
            {pastEvents.length > 0 ? (
              <div className="space-y-3">
                {pastEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}/edit`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = "🎪"; }}
                        />
                      ) : "🎪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)} • {event.venue}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {canBeliFoto(event) ? `${(event.gallery || []).length} foto tersedia` : "Tidak ada foto"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada event lewat</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/events/create" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition group">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-800">Buat Event Baru</p>
              <p className="text-xs text-blue-500">Tambah event ke portal</p>
            </div>
          </Link>
          <Link href="/admin/events" className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition group">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-800">Kelola Event</p>
              <p className="text-xs text-purple-500">Edit & hapus event</p>
            </div>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition group">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-sm font-semibold text-green-700 group-hover:text-green-800">Kelola User</p>
              <p className="text-xs text-green-500">Manajemen pengguna</p>
            </div>
          </Link>
          <Link href="/admin/packages" className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition group">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="text-sm font-semibold text-orange-700 group-hover:text-orange-800">Paket Fotografer</p>
              <p className="text-xs text-orange-500">Atur paket & harga</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdmin(AdminDashboard);
