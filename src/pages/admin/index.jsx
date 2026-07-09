import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/init";
import { useRouter } from "next/router";
import Link from "next/link";
import GoogleLoginButton from "@/pages/components/GoogleLoginButton";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [loggedInAsNonAdmin, setLoggedInAsNonAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Cek apakah user sudah login & punya akses admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            router.push("/admin/dashboard");
            return;
          } else {
            // Logged in tapi bukan admin
            setCurrentUser(user);
            setLoggedInAsNonAdmin(true);
          }
        } catch (e) {
          // Firestore might not be accessible yet
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Harap isi email dan password");
      return;
    }

    setError("");
    setChecking(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Cek apakah user memiliki role admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        router.push("/admin/dashboard");
      } else {
        // Bukan admin — tampilkan error
        setError("⚠️ Akun ini tidak memiliki akses admin.");
        setChecking(false);
      }
    } catch (error) {
      setError("❌ Email atau password salah.");
      setChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Masuk dengan akun administrator
          </p>
        </div>        {/* Login Card */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
          {/* Non-admin warning */}
          {loggedInAsNonAdmin ? (
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Akses Ditolak</h3>
              <p className="text-yellow-300 text-sm mb-4">
                Akun ini terdaftar tapi <strong>bukan administrator</strong>.
              </p>
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-xl p-4 mb-4 text-sm text-yellow-200 text-left">
                <p className="mb-2">💡 Untuk menjadikan akun ini admin:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Kunjungi <Link href="/seed-admin" className="text-blue-400 hover:underline">halaman seed-admin</Link></li>
                  <li>Klik "Promosikan ke Admin"</li>
                  <li>Refresh halaman ini</li>
                </ol>
              </div>
              <Link href="/home" className="text-sm text-gray-400 hover:text-white transition">
                ← Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className="bg-red-900/50 border border-red-800 rounded-xl p-3 mb-5 text-sm text-red-300 text-center">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm"
                />
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={checking}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Memeriksa akses...
                  </>
                ) : (
                  "🔑 Masuk"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="text-sm text-gray-500">atau</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Google Login */}
              <GoogleLoginButton mode="login" redirectTo="" />

              {/* Hint */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Hanya akun dengan role <strong className="text-gray-400">admin</strong> yang dapat mengakses halaman ini.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/home" className="text-sm text-gray-500 hover:text-gray-300 transition">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
