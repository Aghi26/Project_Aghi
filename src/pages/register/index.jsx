import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/init";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import GoogleLoginButton from "@/pages/components/GoogleLoginButton";
import { Tickets, UserPlus, ArrowLeft, XCircle } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    birthdate: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Harap isi nama, email, dan password");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        location: form.location || "",
        birthdate: form.birthdate || "",
        gender: form.gender || "",
        email: user.email,
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      router.push("/home");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Gunakan email lain atau login.");
      } else if (error.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (error.code === "auth/weak-password") {
        setError("Password terlalu lemah. Minimal 6 karakter.");
      } else {
        setError("Registrasi gagal: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center gap-2 mb-4">
            <Tickets className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Jakarta Events
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar untuk mulai menjelajahi event</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama */}
          <div className="mb-4">
            <label className={labelClass}>Nama Lengkap</label>
            <input type="text" placeholder="Nama lengkap" value={form.name}
              onChange={(e) => update("name", e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelClass}>Alamat Email</label>
            <input type="email" placeholder="nama@email.com" value={form.email}
              onChange={(e) => update("email", e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={labelClass}>Kata Sandi</label>
            <input type="password" placeholder="Minimal 6 karakter" value={form.password}
              onChange={(e) => update("password", e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} />
          </div>

          {/* Lokasi */}
          <div className="mb-4">
            <label className={labelClass}>Lokasi <span className="text-gray-400">(opsional)</span></label>
            <input type="text" placeholder="Kota / Provinsi" value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputClass} />
          </div>

          {/* Tanggal Lahir & Jenis Kelamin */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className={labelClass}>Tanggal Lahir <span className="text-gray-400">(opsional)</span></label>
              <input type="date" value={form.birthdate}
                onChange={(e) => update("birthdate", e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jenis Kelamin <span className="text-gray-400">(opsional)</span></label>
              <select value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className={inputClass}>
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Memproses...
              </>
            ) : (
              <><UserPlus className="w-4 h-4" /> Daftar</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-400">atau</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Register */}
          <GoogleLoginButton mode="register" />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition">
              Login di sini
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
