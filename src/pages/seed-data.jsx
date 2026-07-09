import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/init";
import Link from "next/link";
import eventsData from "@/utils/data/events";
import packagesData from "@/utils/data/photographerPackages";
import { news } from "@/utils/data/news";
import galeriImages from "@/utils/data/galeri";

// Cloudinary config
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "yjztwdcz";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "jakarta_events";

/**
 * Upload gambar lokal ke Cloudinary, return secure_url.
 * @param {string} url - URL lokal gambar (misal /assets/berita1.jpg)
 * @returns {Promise<string|null>} - Cloudinary URL atau null kalau gagal
 */
const uploadToCloudinary = async (url) => {
  try {
    // Lewati kalau sudah URL Cloudinary atau URL external
    if (url.startsWith("http") || url.startsWith("https")) return url;

    const fullUrl = `${window.location.origin}${url}`;
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${fullUrl}`);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, url.split("/").pop());
    formData.append("upload_preset", UPLOAD_PRESET);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!uploadRes.ok) {
      const errData = await uploadRes.json();
      throw new Error(errData.error?.message || "Upload gagal");
    }
    const data = await uploadRes.json();
    return data.secure_url;
  } catch (error) {
    console.warn(`Gagal upload ${url}:`, error.message);
    return null; // fallback — tetap pake URL asli nanti
  }
};

export default function SeedDataPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(null); // "events" | "packages" | "news" | "gallery" | null
  const [results, setResults] = useState({ events: null, packages: null, news: null, gallery: null });
  const [messages, setMessages] = useState({ events: "", packages: "", news: "", gallery: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const seedEvents = async () => {
    setSeeding("events");
    setResults((prev) => ({ ...prev, events: null }));
    setMessages((prev) => ({ ...prev, events: "Mengupload gambar ke Cloudinary..." }));
    try {
      const eventsCol = collection(db, "events");
      let count = 0;
      let uploadCount = 0;

      for (const event of eventsData) {
        // Upload thumbnail ke Cloudinary
        let cloudImage = event.image;
        if (event.image && !event.image.startsWith("http")) {
          const uploaded = await uploadToCloudinary(event.image);
          if (uploaded) {
            cloudImage = uploaded;
            uploadCount++;
          }
        }

        // Upload gallery images ke Cloudinary
        let cloudGallery = [...(event.gallery || [])];
        if (cloudGallery.length > 0) {
          const uploadedUrls = await Promise.all(
            cloudGallery.map((img) => uploadToCloudinary(img))
          );
          cloudGallery = uploadedUrls.filter(Boolean);
          if (cloudGallery.length === 0) {
            // Gallery semua gagal upload — fallback ke array kosong
            cloudGallery = [];
          }
        }

        // Simpan ke Firestore dengan URL Cloudinary
        await setDoc(doc(eventsCol, event.id), {
          ...event,
          image: cloudImage,
          gallery: cloudGallery,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }

      setResults((prev) => ({ ...prev, events: "success" }));
      setMessages((prev) => ({
        ...prev,
        events: `${count} event disimpan ke Firestore! ${uploadCount} gambar diupload ke Cloudinary.`,
      }));
    } catch (error) {
      console.error("Error seeding events:", error);
      setResults((prev) => ({ ...prev, events: "error" }));
      setMessages((prev) => ({ ...prev, events: "Gagal: " + error.message }));
    }
    setSeeding(null);
  };

  const seedPackages = async () => {
    setSeeding("packages");
    setResults((prev) => ({ ...prev, packages: null }));
    try {
      const packagesCol = collection(db, "packages");
      let count = 0;
      for (const pkg of packagesData) {
        await setDoc(doc(packagesCol, pkg.id), {
          ...pkg,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      setResults((prev) => ({ ...prev, packages: "success" }));
      setMessages((prev) => ({ ...prev, packages: `${count} paket berhasil disimpan ke Firestore!` }));
    } catch (error) {
      console.error("Error seeding packages:", error);
      setResults((prev) => ({ ...prev, packages: "error" }));
      setMessages((prev) => ({ ...prev, packages: "Gagal: " + error.message }));
    }
    setSeeding(null);
  };

  const seedNews = async () => {
    setSeeding("news");
    setResults((prev) => ({ ...prev, news: null }));
    setMessages((prev) => ({ ...prev, news: "Menyimpan berita ke Firestore..." }));
    try {
      const col = collection(db, "news");
      let count = 0;
      for (const item of news) {
        await setDoc(doc(col, String(item.id)), {
          ...item,
          gambar: item.gambar || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      setResults((prev) => ({ ...prev, news: "success" }));
      setMessages((prev) => ({ ...prev, news: `${count} berita disimpan ke Firestore!` }));
    } catch (error) {
      console.error("Error seeding news:", error);
      setResults((prev) => ({ ...prev, news: "error" }));
      setMessages((prev) => ({ ...prev, news: "Gagal: " + error.message }));
    }
    setSeeding(null);
  };

  const seedGallery = async () => {
    setSeeding("gallery");
    setResults((prev) => ({ ...prev, gallery: null }));
    setMessages((prev) => ({ ...prev, gallery: "Menyimpan galeri ke Firestore..." }));
    try {
      const col = collection(db, "gallery");
      let count = 0;
      for (const img of galeriImages) {
        await setDoc(doc(col, String(img.id)), {
          ...img,
          createdAt: new Date().toISOString(),
        });
        count++;
      }
      setResults((prev) => ({ ...prev, gallery: "success" }));
      setMessages((prev) => ({ ...prev, gallery: `${count} gambar galeri disimpan ke Firestore!` }));
    } catch (error) {
      console.error("Error seeding gallery:", error);
      setResults((prev) => ({ ...prev, gallery: "error" }));
      setMessages((prev) => ({ ...prev, gallery: "Gagal: " + error.message }));
    }
    setSeeding(null);
  };

  const seedAll = async () => {
    await seedEvents();
    await seedPackages();
    await seedNews();
    await seedGallery();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-gray-900">Seed Data ke Firestore</h1>
          <p className="text-sm text-gray-500 mt-1">
            Migrasi data statis ke Firestore collections
          </p>
        </div>

        {/* Firestore Rules Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm">
          <p className="font-medium text-blue-800">ℹ️ Firestore Rules</p>
          <p className="text-blue-600 mt-1">
            Pastikan rules mengizinkan write ke collections <strong>events</strong>, <strong>packages</strong>, <strong>news</strong>, dan <strong>gallery</strong>:
          </p>
          <pre className="bg-blue-900/10 text-blue-800 p-2 rounded-lg text-xs mt-2 overflow-x-auto">
{`match /events/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}
match /packages/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}
match /news/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}
match /gallery/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}`}
          </pre>
        </div>

        {/* Collections to seed */}
        <div className="space-y-4">
          {/* Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">📋 Events</h3>
                <p className="text-xs text-gray-500">{eventsData.length} data statis</p>
              </div>
              <button
                onClick={seedEvents}
                disabled={seeding === "events"}
                className="btn-primary text-sm py-2 px-4"
              >
                {seeding === "events" ? "⏳ Seeding..." : "🌱 Seed Events"}
              </button>
            </div>
            {results.events && (
              <div className={`text-sm rounded-lg p-3 ${
                results.events === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {messages.events}
              </div>
            )}
          </div>

          {/* Packages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">🎫 Paket Fotografer</h3>
                <p className="text-xs text-gray-500">{packagesData.length} data statis</p>
              </div>
              <button
                onClick={seedPackages}
                disabled={seeding === "packages"}
                className="btn-primary text-sm py-2 px-4"
              >
                {seeding === "packages" ? "⏳ Seeding..." : "🌱 Seed Packages"}
              </button>
            </div>
            {results.packages && (
              <div className={`text-sm rounded-lg p-3 ${
                results.packages === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {messages.packages}
              </div>
            )}
          </div>

          {/* News */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">📰 News</h3>
                <p className="text-xs text-gray-500">{news.length} data statis</p>
              </div>
              <button
                onClick={seedNews}
                disabled={seeding === "news"}
                className="btn-primary text-sm py-2 px-4"
              >
                {seeding === "news" ? "⏳ Seeding..." : "🌱 Seed News"}
              </button>
            </div>
            {results.news && (
              <div className={`text-sm rounded-lg p-3 ${
                results.news === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {messages.news}
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">🖼️ Galeri</h3>
                <p className="text-xs text-gray-500">{galeriImages.length} data statis</p>
              </div>
              <button
                onClick={seedGallery}
                disabled={seeding === "gallery"}
                className="btn-primary text-sm py-2 px-4"
              >
                {seeding === "gallery" ? "⏳ Seeding..." : "🌱 Seed Gallery"}
              </button>
            </div>
            {results.gallery && (
              <div className={`text-sm rounded-lg p-3 ${
                results.gallery === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {messages.gallery}
              </div>
            )}
          </div>

          {/* Seed All Button */}
          <button
            onClick={seedAll}
            disabled={seeding !== null}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {seeding !== null ? "⏳ Seeding..." : "🌱 Seed Semua Data"}
          </button>
        </div>

        {/* Navigation */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-400">
            Setelah seed, admin panel akan menggunakan data dari Firestore.
          </p>
          <Link href="/admin" className="inline-block text-sm text-blue-600 hover:underline font-medium">
            → Buka Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
