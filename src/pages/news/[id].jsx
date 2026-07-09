import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import Link from "next/link";

const categoryConfig = {
  Comedy: { bg: "from-red-500 to-rose-500", light: "bg-red-50 text-red-700", icon: "🎭" },
  Concert: { bg: "from-blue-500 to-indigo-500", light: "bg-blue-50 text-blue-700", icon: "🎵" },
  Theater: { bg: "from-green-500 to-emerald-500", light: "bg-green-50 text-green-700", icon: "🎪" },
  Festival: { bg: "from-yellow-500 to-amber-500", light: "bg-yellow-50 text-yellow-700", icon: "🎉" },
};

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchNews = async () => {
      try {
        const docSnap = await getDoc(doc(db, "news", id));
        if (docSnap.exists()) {
          setNewsItem({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error("Error fetching news:", e);
      }
      setLoading(false);
    };
    fetchNews();
  }, [id]);

  if (loading || !id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="skeleton h-64 md:h-80 w-full rounded-none"></div>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="skeleton h-8 w-24 rounded-full"></div>
          <div className="skeleton h-10 w-3/4 rounded-lg"></div>
          <div className="skeleton h-5 w-48 rounded-lg"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-4 w-full rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Berita Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Berita yang Anda cari tidak tersedia.</p>
          <Link href="/news" className="btn-primary inline-flex items-center gap-2">
            <span>←</span> Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[newsItem.category] || categoryConfig.Concert;
  const coverImage = newsItem.gambar || newsItem.image || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt={newsItem.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cat.bg} flex items-center justify-center`}>
            <span className="text-8xl opacity-30">{cat.icon}</span>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all"
          >
            <span>←</span> Kembali
          </Link>
        </div>

        {/* Category & Date on Hero */}
        <div className="absolute bottom-6 left-4 md:left-8 right-4 z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${cat.light}`}>
              {cat.icon} {newsItem.category}
            </span>
            <span className="text-white/80 text-sm">
              📅 {newsItem.date}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
            {newsItem.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {/* Metadata Bar */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100 text-sm text-gray-500">
            <span>📰 {newsItem.category}</span>
            <span>📅 {newsItem.date}</span>
          </div>

          {/* Main Content */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
              {newsItem.konten || newsItem.description || ""}
            </p>
          </div>

          {/* Image in Content (if available and different from hero) */}
          {coverImage && !imgError && (
            <div className="mt-8 rounded-xl overflow-hidden shadow-md">
              <img
                src={coverImage}
                alt={newsItem.title}
                className="w-full object-cover"
              />
            </div>
          )}
        </article>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors bg-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md border border-blue-100"
          >
            <span>←</span> Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    </div>
  );
}
