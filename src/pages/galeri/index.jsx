import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Galeri() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [lightboxError, setLightboxError] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setImages(list);
      } catch (e) {
        console.error("Error fetching gallery:", e);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => {
    setSelectedIndex(null);
    setLightboxError(false);
  };

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Reset lightbox error when navigating to different image
  useEffect(() => {
    setLightboxError(false);
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goToPrev, goToNext]);

  // Skeleton palette for placeholders
  const palette = [
    "from-blue-400 via-indigo-400 to-purple-400",
    "from-emerald-400 via-teal-400 to-cyan-400",
    "from-rose-400 via-pink-400 to-fuchsia-400",
    "from-amber-400 via-orange-400 to-red-400",
    "from-violet-400 via-purple-400 to-indigo-400",
    "from-cyan-400 via-sky-400 to-blue-400",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeleton h-12 w-48 mx-auto mb-4 rounded-xl"></div>
            <div className="skeleton h-5 w-72 mx-auto rounded-lg"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`skeleton rounded-2xl ${i % 2 === 0 ? "h-72" : "h-96"}`}></div>
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
          <div className="absolute top-10 left-10 text-8xl">🖼️</div>
          <div className="absolute bottom-5 right-20 text-6xl">🖼️</div>
          <div className="absolute top-5 right-10 text-4xl">🖼️</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🖼️ Galeri Foto
          </h1>
          <p className="text-lg md:text-xl text-blue-100">
            Koleksi foto-foto terbaik dari berbagai event di Jakarta
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-12">
        {images.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-5xl mb-4">🖼️</p>
            <p className="text-gray-500 text-lg font-medium">Belum ada galeri</p>
            <p className="text-gray-400 text-sm mt-1">Jalankan /seed-data untuk menambahkan data</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Menampilkan <span className="font-semibold text-gray-700">{images.length}</span> foto
              </p>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {images.map((img, index) => {
                const hasError = imgErrors[img.id];
                const gradientClass = palette[index % palette.length];

                return (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  onClick={() => openLightbox(index)}
                >
                  {hasError ? (
                    /* Placeholder on error */
                    <div className={`w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center aspect-[4/3]`}>
                      <span className="text-4xl opacity-40">🖼️</span>
                    </div>
                  ) : (
                    /* Image */
                    <img
                      src={img.url}
                      alt={img.alt || img.caption || ""}
                      className="w-full object-cover group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      onError={() => handleImgError(img.id)}
                    />
                  )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium truncate">
                          {img.alt || img.caption || "Foto"}
                        </p>
                        <p className="text-white/60 text-xs mt-0.5">
                          Klik untuk perbesar
                        </p>
                      </div>
                    </div>

                    {/* Top-right index badge */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {index + 1}/{images.length}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && images[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            onClick={closeLightbox}
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110"
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              aria-label="Selanjutnya"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {lightboxError ? (
                <div className="text-center text-white/60 p-8">
                  <p className="text-6xl mb-4">🖼️</p>
                  <p className="text-sm">Gambar tidak tersedia</p>
                </div>
              ) : (
                <img
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].alt || ""}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                  onError={() => setLightboxError(true)}
                />
              )}
            </div>

            {/* Caption & Counter */}
            <div className="mt-4 text-center">
              <p className="text-white/90 text-sm font-medium">
                {images[selectedIndex].alt || images[selectedIndex].caption || ""}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
