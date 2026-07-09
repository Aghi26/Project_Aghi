import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/init";
import Link from "next/link";

export default function SeedAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "error" | "already_admin"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          if (data.role === "admin") {
            setStatus("already_admin");
          }
        } else {
          // User exists in Auth but doc missing from Firestore
          // Auto-create the doc so the promote button can work
          const newUserData = {
            name: currentUser.displayName || "User",
            email: currentUser.email,
            photoURL: currentUser.photoURL || "",
            phone: "",
            location: "",
            birthdate: "",
            gender: "",
            role: "user",
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", currentUser.uid), newUserData);
          setUserData(newUserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setStatus("error");
        setErrorMessage("Gagal mengambil data user: " + error.message);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePromote = async () => {
    if (!user || !userData) return;

    setPromoting(true);
    setStatus(null);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        role: "admin",
      });

      setUserData((prev) => ({ ...prev, role: "admin" }));
      setStatus("success");
    } catch (error) {
      console.error("Error promoting to admin:", error);
      setStatus("error");
      setErrorMessage(error.message);
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memeriksa user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🛡️</p>
          <h1 className="text-2xl font-bold text-gray-900">Setup Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Promosikan akun Anda menjadi administrator
          </p>
        </div>

        {/* Firestore Rules Warning — visible before any action */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <div>
              <p className="font-medium text-blue-800">
                Firestore Security Rules
              </p>
              <p className="text-blue-600 mt-1">
                Pastikan rules mengizinkan user menulis ke dokumennya sendiri:
              </p>
              <pre className="bg-blue-900/10 text-blue-800 p-2 rounded-lg text-xs mt-2 overflow-x-auto">
{`match /users/{userId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == userId;
}`}
              </pre>
              <p className="text-blue-600 mt-1">
                Atur di Firebase Console → Firestore → Rules
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Akun Saat Ini
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 flex-shrink-0">
              {userData?.name
                ? userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {userData?.name || user?.displayName || "User"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">User ID</span>
              <span className="text-gray-700 font-mono text-xs select-all bg-white px-1.5 py-0.5 rounded border border-gray-200 max-w-[200px] truncate">
                {user?.uid}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role Saat Ini</span>
              <span
                className={`font-medium ${
                  userData?.role === "admin"
                    ? "text-purple-600"
                    : "text-gray-600"
                }`}
              >
                {userData?.role === "admin" ? "🛡️ Admin" : "👤 User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-medium ${
                  userData?.isActive !== false
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {userData?.isActive !== false ? "✅ Aktif" : "❌ Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {status === "already_admin" && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="font-semibold text-purple-800">
                  Anda sudah menjadi Admin!
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Akun ini sudah memiliki role admin. Silakan akses panel admin.
                </p>
                <Link
                  href="/admin/dashboard"
                  className="inline-block mt-3 text-sm font-medium text-purple-700 hover:underline"
                >
                  → Buka Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-green-800">
                  Berhasil menjadi Admin!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Akun Anda sekarang memiliki akses penuh ke panel admin.
                </p>
                <Link
                  href="/admin/dashboard"
                  className="inline-block mt-3 text-sm font-medium text-green-700 hover:underline"
                >
                  → Buka Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-semibold text-red-800">Gagal!</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Promote Button */}
        {userData?.role !== "admin" && status !== "error" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Tombol di bawah akan mengubah role akun Anda menjadi{" "}
              <strong>Administrator</strong>. Anda akan mendapatkan akses penuh
              ke panel admin.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-4">
              ⚠️ Pastikan Anda benar-benar ingin menjadikan akun ini sebagai
              admin. Tindakan ini bisa dilakukan dari halaman manajemen user
              nantinya.
            </div>

            <button
              onClick={handlePromote}
              disabled={promoting}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {promoting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Memproses...
                </>
              ) : (
                "🛡️ Promosikan ke Admin"
              )}
            </button>
          </div>
        )}

        {/* Alternative: Firebase Console Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
          <details>
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              🔧 Alternatif: Manual via Firebase Console
            </summary>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Buka{" "}
                  <a
                    href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_PROJECT_ID}/firestore/data`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Firebase Console → Firestore
                  </a>
                </li>
                <li>Klik koleksi <strong>users</strong></li>
                <li>
                  Cari dokumen dengan UID:{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs select-all">
                    {user?.uid}
                  </code>
                </li>
                <li>Klik dokumen tersebut</li>
                <li>
                  Ubah field <code className="bg-gray-100 px-1 rounded">role</code> dari{" "}
                  <code className="bg-gray-100 px-1 rounded">"user"</code> menjadi{" "}
                  <code className="bg-gray-100 px-1 rounded">"admin"</code>
                </li>
                <li>Klik <strong>Save</strong></li>
              </ol>
              <p className="text-xs text-gray-400 mt-2">
                Pastikan Anda sudah login dengan akun yang ingin dijadikan admin
                agar dokumennya sudah ada di Firestore.
              </p>
            </div>
          </details>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/home"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
