import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        const ordersList = [];
        ordersSnap.forEach((o) => ordersList.push({ id: o.id, ...o.data() }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== "all") result = result.filter((o) => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          (o.userName || "").toLowerCase().includes(q) ||
          (o.eventTitle || "").toLowerCase().includes(q) ||
          (o.id || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return db2 - da;
    });
    return result;
  }, [orders, filterStatus, search]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Gagal mengupdate status: " + error.message);
    }
  };

  const formatPrice = (price) => `Rp${(price || 0).toLocaleString()}`;

  const formatDate = (dateOrTimestamp) => {
    let d;
    if (dateOrTimestamp?.toDate) {
      d = dateOrTimestamp.toDate();
    } else {
      d = new Date(dateOrTimestamp || Date.now());
    }
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getStatusColors = (status) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return option ? option.color : "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const doneOrders = orders.filter((o) => o.status === "done");
  const totalRevenue = doneOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {orders.length} orders ({pendingCount} pending, {doneOrders.length} selesai)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Contacted</p>
            <p className="text-xl font-bold text-blue-600">{orders.filter((o) => o.status === "contacted").length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Revenue (Done)</p>
            <p className="text-xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="Cari order..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="all">Semua Status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipe</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-gray-900">{order.id?.slice(0, 8) || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.userName || "-"}</p>
                        {order.userPhone && (
                          <a href={`https://wa.me/${order.userPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-700 hover:underline font-medium">
                            📱 {order.userPhone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 max-w-[180px] truncate" title={order.eventTitle}>{order.eventTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.orderType === "photographer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {order.orderType === "photographer" ? "📸 Fotografer" : "🖼️ Foto"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <select value={order.status || "pending"} onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs rounded-lg border-0 px-2 py-1 font-medium cursor-pointer ${getStatusColors(order.status)}`}>
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition">👁️ Detail</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <p className="text-3xl mb-2">📦</p>
                      <p className="text-sm">{search ? `Tidak ada order untuk "${search}"` : "Belum ada order"}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && (
          <DetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateStatus}
            formatPrice={formatPrice}
            formatDate={formatDate}
            STATUS_OPTIONS={STATUS_OPTIONS}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function DetailModal({ order, onClose, onUpdateStatus, formatPrice, formatDate, STATUS_OPTIONS }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!order.userId) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, "users", order.userId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [order.userId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl modal-content max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">📦 Detail Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-4">
          {/* Order ID & Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Order ID</span>
            <span className="font-mono text-xs font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tanggal Order</span>
            <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tanggal Event</span>
            <span className="text-sm text-gray-900">{order.eventDate || "-"}</span>
          </div>

          <hr className="border-gray-100" />

          {/* Informasi User */}
          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            👤 Informasi User
            {loadingProfile && <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Nama (dari order)</p>
              <p className="font-medium text-gray-900 text-sm">{order.userName || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">WhatsApp</p>
              {order.userPhone ? (
                <a href={`https://wa.me/${order.userPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:text-green-700 hover:underline text-sm">
                  📱 {order.userPhone}
                </a>
              ) : (
                <p className="font-medium text-gray-900 text-sm">-</p>
              )}
            </div>
          </div>

          {/* User Profile dari Firestore */}
          {userProfile && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-500">Email</p>
                <p className="font-medium text-blue-900 text-sm truncate" title={userProfile.email}>{userProfile.email || "-"}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-500">Lokasi</p>
                <p className="font-medium text-blue-900 text-sm">{userProfile.location || "-"}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-500">Role</p>
                <p className="font-medium text-blue-900 text-sm">{userProfile.role || "user"}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-500">Tgl Daftar</p>
                <p className="font-medium text-blue-900 text-sm">{userProfile.createdAt ? formatDate(userProfile.createdAt) : "-"}</p>
              </div>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Detail Order */}
          <h4 className="font-semibold text-gray-900 text-sm">📋 Detail Order</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Event</p>
              <p className="font-medium text-gray-900 text-sm">{order.eventTitle || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Tipe Order</p>
              <p className="font-medium text-gray-900 text-sm">
                {order.orderType === "photographer" ? "📸 Sewa Fotografer" : "🖼️ Beli Foto"}
              </p>
            </div>
            {order.packageName && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Paket</p>
                <p className="font-medium text-gray-900 text-sm">{order.packageName}</p>
              </div>
            )}
            {order.quantity > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Jumlah</p>
                <p className="font-medium text-gray-900 text-sm">{order.quantity} {order.orderType === "photographer" ? "sesi" : "foto"}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Harga</p>
              <p className="font-medium text-gray-900 text-sm font-bold text-blue-600">{formatPrice(order.totalPrice)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Status</p>
              <select value={order.status || "pending"} onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                className="text-sm font-medium border-0 bg-transparent p-0 cursor-pointer focus:ring-0">
                {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>

          {order.notes && (
            <>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs text-gray-500 mb-1">📝 Catatan</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{order.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* WhatsApp Link */}
        {order.userPhone && (
          <div className="mt-4">
            <a href={`https://wa.me/${order.userPhone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(order.userName || "User")}%2C%20saya%20dari%20Jakarta%20Events.%20Ada%20informasi%20mengenai%20pesanan%20${encodeURIComponent(order.eventTitle || "")}%20Anda.`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition text-sm">
              💬 Hubungi via WhatsApp
            </a>
          </div>
        )}

        <div className="mt-3">
          <button onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAdmin(AdminOrders);
