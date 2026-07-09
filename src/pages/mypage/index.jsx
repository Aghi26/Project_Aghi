import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/init";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Mypage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    birthdate: "",
    gender: "",
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login?redirect=/mypage");
        return;
      }
      setUser(currentUser);
      try {
        // Ambil data profil
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            location: data.location || "",
            birthdate: data.birthdate || "",
            gender: data.gender || "",
          });
        }

        // Ambil riwayat order
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const ordersSnap = await getDocs(ordersQuery);
        const ordersList = [];
        ordersSnap.forEach((o) => ordersList.push({ id: o.id, ...o.data() }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: form.name,
        phone: form.phone,
        location: form.location,
        birthdate: form.birthdate,
        gender: form.gender,
        updatedAt: new Date().toISOString(),
      });
      setUserData((prev) => ({ ...prev, ...form }));
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle ISO date (from Firestore serverTimestamp or regular ISO)
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Rp0";
    return `Rp${(price).toLocaleString()}`;
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    contacted: orders.filter((o) => o.status === "contacted").length,
    done: orders.filter((o) => o.status === "done").length,
    totalSpent: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "⏳ Pending" },
      contacted: { bg: "bg-blue-100", text: "text-blue-700", label: "📞 Dihubungi" },
      done: { bg: "bg-green-100", text: "text-green-700", label: "✅ Selesai" },
    };
    const s = map[status] || map.pending;
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👤</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Page</h1>
            <p className="text-sm text-gray-500">Kelola profil dan lihat riwayat pemesanan Anda</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Order</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.contacted}</p>
            <p className="text-xs text-gray-500 mt-1">Dihubungi</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.done}</p>
            <p className="text-xs text-gray-500 mt-1">Selesai</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">📋 Profil Saya</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    ✏️ Edit
                  </button>
                ) : null}
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Nama</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{userData?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{user?.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">No. WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{userData?.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Lokasi</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{userData?.location || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Tanggal Lahir</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{userData?.birthdate ? formatDate(userData.birthdate) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Jenis Kelamin</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{userData?.gender || "-"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">No. WhatsApp</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="628123456789"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <p className="text-xs text-gray-400 mt-1">Format: 628xxx (tanpa +)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi</label>
                    <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Kota / Provinsi"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                      <input type="date" value={form.birthdate} onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                      <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                      {saving ? "⏳ Menyimpan..." : "💾 Simpan"}
                    </button>
                    <button onClick={() => { setEditMode(false); setForm({ name: userData?.name || "", phone: userData?.phone || "", location: userData?.location || "", birthdate: userData?.birthdate || "", gender: userData?.gender || "" }); }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      Batal
                    </button>
                  </div>
                  {saved && (
                    <p className="text-sm text-green-600 text-center font-medium">✅ Profil berhasil disimpan!</p>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Total Pengeluaran</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(orderStats.totalSpent)}</p>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">📦 Riwayat Pemesanan</h2>
                {orders.length > 0 && (
                  <span className="text-xs text-gray-400">{orders.length} order</span>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                        {order.orderType === "photographer" ? "📸" : "🖼️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{order.eventTitle || "Event"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.orderType === "photographer" ? "📸 Sewa Fotografer" : "🖼️ Beli Foto"}
                              {order.packageName ? ` • ${order.packageName}` : ""}
                              {order.quantity ? ` • ${order.quantity} foto` : ""}
                            </p>
                          </div>
                          {statusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>📅 {formatDate(order.createdAt?.toDate?.() || order.createdAt)}</span>
                          {order.totalPrice > 0 && <span>💰 {formatPrice(order.totalPrice)}</span>}
                          {order.userPhone && <span>📱 {order.userPhone}</span>}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic truncate">📝 {order.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm font-medium">Belum ada pemesanan</p>
                  <p className="text-xs mt-1">Sewa fotografer atau beli foto event untuk mulai</p>
                  <Link href="/home" className="inline-block mt-4 btn-primary text-sm">
                    🎪 Lihat Event
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
