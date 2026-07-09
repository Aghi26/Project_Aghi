import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";

const bulanList = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember"
];

const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const categoryConfig = {
  Comedy: { bg: "from-red-500 to-rose-500", light: "bg-red-50 text-red-700", icon: "🎭", border: "border-red-200" },
  Concert: { bg: "from-blue-500 to-indigo-500", light: "bg-blue-50 text-blue-700", icon: "🎵", border: "border-blue-200" },
  Theater: { bg: "from-green-500 to-emerald-500", light: "bg-green-50 text-green-700", icon: "🎪", border: "border-green-200" },
  Festival: { bg: "from-yellow-500 to-amber-500", light: "bg-yellow-50 text-yellow-700", icon: "🎉", border: "border-yellow-200" },
};

export default function Kalender() {
  const [bulanIndex, setBulanIndex] = useState(() => new Date().getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const animTimeout = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimeout.current) clearTimeout(animTimeout.current);
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setEvents(list);
      } catch (e) {
        console.error("Error fetching events:", e);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const tahun = new Date().getFullYear();
  const jumlahHari = new Date(tahun, bulanIndex + 1, 0).getDate();

  // Map Firestore events into schedule format
  const eventBulan = events
    .filter((ev) => {
      if (!ev.date) return false;
      const d = new Date(ev.date + "T00:00:00");
      return d.getMonth() === bulanIndex && d.getFullYear() === tahun;
    })
    .map((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      return {
        id: ev.id,
        tanggal: d.getDate(),
        hari: hariList[d.getDay()],
        kategori: ev.category || "Concert",
        waktu: ev.time || ev.waktu || "00:00",
        nama: ev.title,
        image: ev.image || "",
      };
    });

  // Kelompokkan event per tanggal
  const eventsByDate = {};
  eventBulan.forEach((ev) => {
    if (!eventsByDate[ev.tanggal]) eventsByDate[ev.tanggal] = [];
    eventsByDate[ev.tanggal].push(ev);
  });

  const tanggalDenganEvent = Object.keys(eventsByDate)
    .map(Number)
    .sort((a, b) => a - b);

  const totalEventBulan = eventBulan.length;

  const changeMonth = (dir) => {
    if (animating) return;
    setAnimating(true);
    if (animTimeout.current) clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(() => {
      if (dir === "prev" && bulanIndex > 0) setBulanIndex(bulanIndex - 1);
      if (dir === "next" && bulanIndex < 11) setBulanIndex(bulanIndex + 1);
      setAnimating(false);
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeleton h-12 w-48 mx-auto mb-4 rounded-xl"></div>
            <div className="skeleton h-5 w-72 mx-auto rounded-lg"></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="skeleton h-10 w-10 rounded-full"></div>
              <div className="skeleton h-8 w-48 rounded-lg"></div>
              <div className="skeleton h-10 w-10 rounded-full"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">📅</div>
          <div className="absolute bottom-5 right-20 text-6xl">📅</div>
          <div className="absolute top-5 right-10 text-4xl">📅</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📅 Jadwal Event
          </h1>
          <p className="text-lg md:text-xl text-blue-100">
            Lihat jadwal lengkap event-event seru di Jakarta
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 pb-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Month Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth("prev")}
                disabled={bulanIndex === 0 || animating}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xl font-bold"
              >
                ←
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {bulanList[bulanIndex]} {tahun}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {totalEventBulan} event {totalEventBulan > 0 ? "tersedia" : ""}
                </p>
              </div>

              <button
                onClick={() => changeMonth("next")}
                disabled={bulanIndex === 11 || animating}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xl font-bold"
              >
                →
              </button>
            </div>
          </div>

          {/* Event List */}
          <div className="p-6">
            {totalEventBulan === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-500 text-lg font-medium">Belum ada event di bulan ini</p>
                <p className="text-gray-400 text-sm mt-1">Coba pilih bulan lainnya</p>
              </div>
            ) : (
              <div className={`space-y-6 transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
                {tanggalDenganEvent.map((tanggal) => {
                  const hariKe = new Date(tahun, bulanIndex, tanggal).getDay();
                  const items = eventsByDate[tanggal];
                  const isToday = new Date().getDate() === tanggal &&
                    new Date().getMonth() === bulanIndex &&
                    new Date().getFullYear() === tahun;

                  return (
                    <div key={tanggal}>
                      {/* Date Header */}
                      <div className={`flex items-center gap-3 mb-3 ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                          isToday
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          <span className="text-xs font-bold uppercase leading-none">{hariList[hariKe].slice(0, 3)}</span>
                          <span className="text-lg font-bold leading-tight">{tanggal}</span>
                        </div>
                        {isToday && (
                          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      {/* Event Cards */}
                      <div className="space-y-3 ml-1">
                        {items.map((ev, idx) => {
                          const cat = categoryConfig[ev.kategori] || categoryConfig.Concert;

                          return (
                            <Link
                              key={`${ev.id}-${idx}`}
                              href={`/events/${ev.id}`}
                              className="group flex items-stretch gap-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                            >
                              {/* Category Color Bar */}
                              <div className={`w-2 bg-gradient-to-b ${cat.bg} flex-shrink-0 rounded-l-xl`}></div>

                              {/* Content */}
                              <div className="flex-1 py-3.5 pr-4">
                                {/* Category Badge */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.light}`}>
                                    {cat.icon} {ev.kategori}
                                  </span>
                                  <span className="text-xs text-gray-400">{ev.waktu} WIB</span>
                                </div>

                                {/* Event Name */}
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {ev.nama}
                                </h3>
                              </div>

                              {/* Arrow */}
                              <div className="flex items-center pr-4 text-gray-300 group-hover:text-blue-500 transition-colors">
                                <span className="text-lg">→</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend / Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Klik event untuk melihat detail dan melakukan pemesanan
          </p>
        </div>
      </div>
    </div>
  );
}
