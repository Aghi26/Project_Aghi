import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/init";
import OrderForm from "@/pages/components/OrderForm";
import UnlockOverlay from "@/pages/components/UnlockOverlay";
import { getEventStatus, canSewaFotografer, canBeliFoto } from "@/utils/eventStatus";

const categoryColors = {
  Concert: { bg: "bg-blue-100", text: "text-blue-700" },
  Comedy: { bg: "bg-red-100", text: "text-red-700" },
  Theater: { bg: "bg-green-100", text: "text-green-700" },
  Festival: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderType, setOrderType] = useState(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle redirect back from login
  useEffect(() => {
    if (!router.query.action || !user) return;
    const action = router.query.action;
    // Clean query params
    router.replace(`/events/${id}`, undefined, { shallow: true });
    // Open the appropriate modal
    if (action === "sewa") {
      handleSewaFotografer();
    } else if (action === "beli") {
      handleBeliFoto();
    }
  }, [router.query.action, user]);

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
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const formatDate = (dateStr) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const requireAuth = (actionType) => {
    if (!user) {
      router.push(`/login?redirect=/events/${id}?action=${actionType}`);
      return;
    }
    if (actionType === "sewa") {
      handleSewaFotografer();
    } else if (actionType === "beli") {
      handleBeliFoto();
    }
  };

  const handleSewaFotografer = () => {
    setOrderType("photographer");
    setShowOrderForm(true);
  };

  const handleBeliFoto = () => {
    setOrderType("photo");
    setShowOrderForm(true);
    setShowUnlock(false);
  };

  if (!id || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="skeleton h-64 md:h-80 w-full rounded-none"></div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="skeleton h-5 w-32 mb-6 rounded-lg"></div>
          <div className="skeleton h-10 w-3/4 mb-6 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl"></div>
            ))}
          </div>
          <div className="skeleton h-6 w-48 mb-3 rounded-lg"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-4 w-full mb-2 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Event yang Anda cari tidak tersedia di Firestore</p>
          <Link href="/home" className="btn-primary">← Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  const catColor = categoryColors[event.category] || categoryColors.Concert;
  const isUpcoming = getEventStatus(event) === "upcoming";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-full text-sm font-medium hover:bg-white shadow-sm border border-gray-200/60 hover:shadow-md mb-6 transition-all"
        >
          <span>←</span>
          <span>Kembali ke Home</span>
        </Link>

        {/* Hero Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg mb-6">
          {event.image && !heroImgError ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={() => setHeroImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-6xl">🎪</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text}`}>
              {event.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isUpcoming ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {isUpcoming ? "🟢 Akan Datang" : "🔴 Sudah Lewat"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {event.title}
        </h1>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">
                {formatDate(event.date)}
                {event.endDate ? ` - ${formatDate(event.endDate)}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">⏰</span>
            <div>
              <p className="text-sm text-gray-500">Waktu</p>
              <p className="font-medium">{event.time} WIB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="font-medium">{event.venue}</p>
              <p className="text-sm text-gray-500">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">🎫</span>
            <div>
              <p className="text-sm text-gray-500">Harga Sewa Fotografer</p>
              <p className="font-medium">
                {canSewaFotografer(event) && event.photographerPrice > 0
                  ? `Rp ${event.photographerPrice.toLocaleString()}`
                  : canBeliFoto(event)
                  ? `Rp ${(event.photoPrice || 0).toLocaleString()} / foto`
                  : "Tidak tersedia"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Tentang Event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* CTA Section - Sewa Fotografer (Untuk Event Akan Datang) */}
        {canSewaFotografer(event) && event.photographerPrice > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 md:p-8 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-5xl">📸</div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Sewa Fotografer untuk Event Ini
                </h3>
                <p className="text-gray-600 mb-2">
                  Abadikan momen spesial Anda dengan fotografer profesional!
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Mulai dari Rp {event.photographerPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => requireAuth("sewa")}
                className="btn-primary text-lg px-8 py-4 whitespace-nowrap"
              >
                📸 Sewa Fotografer Sekarang
              </button>
            </div>
          </div>
        )}

        {/* CTA Section - Beli Foto (Untuk Event Sudah Lewat) */}
        {canBeliFoto(event) && event.photoPrice > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 md:p-8 mb-8 border border-green-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-5xl">🖼️</div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Beli Foto Event Ini
                </h3>
                <p className="text-gray-600 mb-2">
                  Dapatkan foto-foto terbaik dari event ini! Semua foto akan dikirimkan ke WhatsApp Anda.
                </p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {event.photoPrice.toLocaleString()} / foto
                </p>
              </div>
              <button
                onClick={() => requireAuth("beli")}
                className="px-8 py-4 text-lg font-semibold whitespace-nowrap bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                🛒 Beli Foto Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section - Untuk Event Sudah Lewat */}
        {canBeliFoto(event) && (event.gallery || []).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📸 Galeri Foto Event
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.gallery.map((photo, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg overflow-hidden ${
                    index === 0 ? "" : "cursor-pointer group"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className={`w-full aspect-square object-cover ${
                      index === 0 ? "" : "blur-8 group-hover:blur-[4px] transition-all duration-300"
                    }`}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/400x400/6B7280/FFFFFF?text=Foto+${index + 1}`;
                    }}
                  />
                  {index === 0 ? (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      ✅ Terbuka
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowUnlock(true)}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="text-center text-white">
                        <p className="text-3xl mb-2">🔒</p>
                        <p className="text-sm font-medium">Klik untuk buka</p>
                      </div>
                    </div>
                  )}
                  {index > 0 && (
                    <div className="absolute top-2 left-2 bg-gray-800/80 text-white px-2 py-1 rounded text-xs font-semibold">
                      🔒 Terkunci
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {canSewaFotografer(event) && event.photographerPrice > 0 && (
          <div className="text-center py-6">
            <button
              onClick={() => requireAuth("sewa")}
              className="btn-primary text-lg px-10 py-4"
            >
              📸 Sewa Fotografer Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Unlock Overlay - untuk beli foto */}
      {showUnlock && (
        <UnlockOverlay
          event={event}
          onBeli={() => requireAuth("beli")}
          onClose={() => setShowUnlock(false)}
        />
      )}

      {/* Order Form Modal - untuk sewa fotografer & beli foto */}
      {showOrderForm && (
        <OrderForm
          event={event}
          orderType={orderType}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}