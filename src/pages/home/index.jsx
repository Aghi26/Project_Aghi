import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";
import EventCard from "@/pages/components/EventCard";
import { getEventStatus } from "@/utils/eventStatus";


export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const eventsList = [];
        eventsSnap.forEach((doc) => eventsList.push({ id: doc.id, ...doc.data() }));
        eventsList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Filter by tab + search
  const filteredEvents = events.filter((event) => {
    const status = getEventStatus(event);
    if (filter === "upcoming" && status !== "upcoming") return false;
    if (filter === "past" && status !== "past") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (event.title || "").toLowerCase().includes(q) ||
        (event.venue || "").toLowerCase().includes(q) ||
        (event.location || "").toLowerCase().includes(q) ||
        (event.category || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const upcomingEvents = events.filter((e) => getEventStatus(e) === "upcoming");
  const pastEvents = events.filter((e) => getEventStatus(e) === "past");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto text-center">            <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎪 Temukan & Abadikan Setiap Momen
          </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">Portal event terbaik di Jakarta</p>
            <div className="max-w-xl mx-auto skeleton h-16 rounded-xl"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-28 rounded-full"></div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-72 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner — Festival Edition */}
      <div className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-800 text-white pt-20 pb-24 px-4 overflow-hidden">
        {/* Animated confetti particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 animate-bounce opacity-20 text-7xl" style={{ animationDuration: "3s" }}>🎉</div>
          <div className="absolute top-20 right-10 animate-bounce opacity-20 text-5xl" style={{ animationDuration: "4s" }}>✨</div>
          <div className="absolute bottom-10 left-1/4 animate-bounce opacity-20 text-5xl" style={{ animationDuration: "3.5s" }}>🎊</div>
          <div className="absolute top-10 left-1/3 animate-bounce opacity-15 text-4xl" style={{ animationDuration: "5s" }}>🌟</div>
          <div className="absolute bottom-20 right-1/3 animate-bounce opacity-20 text-6xl" style={{ animationDuration: "4.2s" }}>🎵</div>
          <div className="absolute top-1/2 left-10 animate-bounce opacity-15 text-4xl" style={{ animationDuration: "2.8s" }}>🎭</div>
          <div className="absolute bottom-5 right-10 animate-bounce opacity-15 text-5xl" style={{ animationDuration: "3.7s" }}>🎪</div>
        </div>

        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-pink-500/10 blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-300/10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 mb-6">
            <span></span>
            <span>Portal Event Resmi Jakarta</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-200 to-white bg-clip-text text-transparent">
              Temukan & Abadikan
            </span>
            <br />
            <span>Setiap Momen</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Konser spektakuler, comedy show, teater memukau, dan festival seru —
            semuanya di Jakarta!
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-xl opacity-40 group-hover:opacity-70 blur transition-all duration-300"></div>
            <div className="relative flex items-center">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10">🔍</span>
              <input
                type="text"
                placeholder="Cari event favoritmu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-lg shadow-xl"
              />
            </div>
          </div>

          {/* Trending Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
            <span>🔥 Trending:</span>
            {["BLACKPINK", "Tulus", "Comedy Night", "JKT48"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition text-white/70 hover:text-white"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tab */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              filter === "upcoming"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            🟢 Akan Datang
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              filter === "past"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            🔴 Sudah Lewat
          </button>
        </div>

        {/* Search result info */}
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            Menampilkan hasil untuk "{search}" ({filteredEvents.length} ditemukan)
          </p>
        )}

        {/* Filtered Results (jika filter/search aktif) */}
        {filter !== "all" || search ? (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">🎭</p>
                  <p className="text-lg">Tidak ada event yang ditemukan</p>
                  <p className="text-sm mt-2">Coba ubah kata kunci pencarian</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Event Mendatang Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎪 Event Mendatang
                </h2>
                <button
                  onClick={() => setFilter("upcoming")}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Lihat Semua →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>

            {/* Event Sudah Lewat Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📸 Event Sudah Lewat
                </h2>
                <button
                  onClick={() => setFilter("past")}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Lihat Semua →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
