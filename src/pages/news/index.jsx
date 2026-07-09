import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";
import { Newspaper, Drama, Music, Tickets, Sparkles, Calendar } from "lucide-react";

const categoryColors = {
  Comedy: { bg: "from-red-500 to-rose-500", light: "bg-red-50 text-red-700" },
  Concert: { bg: "from-blue-500 to-indigo-500", light: "bg-blue-50 text-blue-700" },
  Theater: { bg: "from-green-500 to-emerald-500", light: "bg-green-50 text-green-700" },
  Festival: { bg: "from-yellow-500 to-amber-500", light: "bg-yellow-50 text-yellow-700" },
};

const categoryIcons = {
  Comedy: Drama,
  Concert: Music,
  Theater: Tickets,
  Festival: Sparkles,
};

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const snap = await getDocs(collection(db, "news"));
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNews(list);
      } catch (e) {
        console.error("Error fetching news:", e);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeleton h-12 w-48 mx-auto mb-4 rounded-xl"></div>
            <div className="skeleton h-5 w-72 mx-auto rounded-lg"></div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="skeleton h-48 w-full"></div>
                <div className="p-5 space-y-3">
                  <div className="skeleton h-6 w-24 rounded-full"></div>
                  <div className="skeleton h-6 w-full rounded-lg"></div>
                  <div className="skeleton h-4 w-3/4 rounded-lg"></div>
                  <div className="skeleton h-4 w-full rounded-lg"></div>
                </div>
              </div>
            ))}
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
          <Newspaper className="absolute top-10 left-10 w-24 h-24 text-white" />
          <Newspaper className="absolute bottom-5 right-20 w-16 h-16 text-white" />
          <Newspaper className="absolute top-5 right-10 w-10 h-10 text-white" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Berita & Informasi
          </h1>
          <p className="text-lg md:text-xl text-blue-100">
            Update terbaru seputar event dan acara di Jakarta
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10 pb-12">
        {news.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Belum ada berita</p>
            <p className="text-gray-400 text-sm mt-2">Jalankan /seed-data untuk menambahkan data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => {
              const catColor = categoryColors[item.category] || categoryColors.Concert;
              const CatIcon = categoryIcons[item.category] || null;
              const hasImage = item.gambar && !imgErrors[item.id];

              return (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {hasImage ? (
                      <img
                        src={item.gambar}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => handleImgError(item.id)}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${catColor.bg} flex items-center justify-center`}>
                        {CatIcon && <CatIcon className="w-12 h-12 opacity-50 text-white" />}
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${catColor.light}`}>
                        {CatIcon && <CatIcon className="w-3.5 h-3.5" />}{item.category}
                      </span>
                    </div>
                    {/* Date */}
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{item.date}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {item.konten || item.description || ""}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Baca selengkapnya</span>
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
