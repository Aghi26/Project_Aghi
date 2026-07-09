import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/init";
import WhatsAppButton from "./WhatsAppButton";
import { useToast } from "./Toast";

export default function OrderForm({ event, orderType, onClose }) {
  if (!event || !orderType) return null;
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    package: "",
    quantity: 1,
    notes: "",
  });
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  // Ambil data user & packages dari Firestore
  useEffect(() => {
    const fetchData = async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setForm((prev) => ({
            ...prev,
            name: data.name || currentUser.displayName || "",
            phone: data.phone || "",
          }));
        }
      }

      // Ambil packages dari Firestore
      try {
        const packagesSnap = await getDocs(collection(db, "packages"));
        const packagesList = [];
        packagesSnap.forEach((p) => packagesList.push({ id: p.id, ...p.data() }));
        packagesList.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
        setPackages(packagesList);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
      setLoadingPackages(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      fetchData(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isPhotographer = orderType === "photographer";
  const title = isPhotographer ? "📸 Sewa Fotografer" : "🛒 Beli Foto Event";

  // Hitung total harga
  const selectedPackage = packages.find((p) => p.id === form.package);
  const totalPrice = isPhotographer
    ? selectedPackage?.price || 0
    : (event.photoPrice || 0) * form.quantity;

  // Format pesan WhatsApp
  const formatMessage = () => {
    if (isPhotographer) {
      return `Halo kak, saya ingin menyewa fotografer untuk event:

━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAIL PEMESANAN
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Event    : ${event.title}
📅 Tanggal  : ${event.date}
👤 Nama     : ${form.name}
📱 WhatsApp : ${form.phone}
📦 Paket    : ${selectedPackage?.name || "-"} (Rp ${selectedPackage?.price?.toLocaleString() || "0"})
💰 Total    : Rp ${totalPrice.toLocaleString()}
📝 Catatan  : ${form.notes || "-"}

━━━━━━━━━━━━━━━━━━━━━━━━
Terima kasih!`;
    } else {
      return `Halo kak, saya ingin membeli foto event:

━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAIL PEMBELIAN
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Event    : ${event.title}
📅 Tanggal  : ${event.date}
👤 Nama     : ${form.name}
📱 WhatsApp : ${form.phone}
🖼️ Jumlah   : ${form.quantity} foto
💰 Total    : Rp ${totalPrice.toLocaleString()}
📝 Catatan  : ${form.notes || "-"}

━━━━━━━━━━━━━━━━━━━━━━━━
Terima kasih!`;
    }
  };

  // Simpan order ke Firestore
  const saveOrder = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: form.name,
        userPhone: form.phone,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        orderType: orderType,
        package: form.package,
        packageName: selectedPackage?.name || "",
        quantity: form.quantity,
        notes: form.notes,
        totalPrice: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone) {
      toast.error("Harap isi nama dan nomor WhatsApp");
      return;
    }
    if (isPhotographer && !form.package) {
      toast.error("Harap pilih paket fotografer");
      return;
    }
    setSubmitted(true);
    saveOrder();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pesanan Siap Dikirim!
            </h3>
            <p className="text-gray-600 mb-6">
              Klik tombol di bawah untuk mengirim pesanan via WhatsApp
            </p>
            <WhatsAppButton
              phone={event.adminPhone}
              message={formatMessage()}
              label="📤 Kirim via WhatsApp"
            />
            <button
              onClick={onClose}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Tutup
            </button>
          </div>
        ) : (
          /* Form */
          <div className="p-6 space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Nama lengkap"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* No WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                placeholder="628123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: 628xxx (tanpa +)
              </p>
            </div>

            {/* Nama Event (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Event
              </label>
              <input
                type="text"
                value={event.title}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Tanggal Event (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Event
              </label>
              <input
                type="text"
                value={event.date}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Paket Fotografer (untuk sewa) */}
            {isPhotographer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paket Fotografer
                </label>
                <select
                  value={form.package}
                  onChange={(e) => setForm({ ...form, package: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Pilih Paket</option>
                  {loadingPackages ? (
                    <option value="" disabled>Memuat paket...</option>
                  ) : (
                    packages
                      .filter((p) => p.isActive !== false)
                      .map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - Rp {pkg.price?.toLocaleString()} ({pkg.description})
                        </option>
                      ))
                  )}
                </select>
              </div>
            )}

            {/* Jumlah Foto (untuk beli foto) */}
            {!isPhotographer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Foto
                </label>
                <select
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {[1, 2, 3, 5, 10, 15, 20, 30].map((num) => (
                    <option key={num} value={num}>
                      {num} foto {num >= 5 ? `- Rp ${(event.photoPrice * num).toLocaleString()}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Total Harga */}
            {totalPrice > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Total Harga</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {totalPrice.toLocaleString()}
                </p>
              </div>
            )}

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                placeholder="Tulis catatan..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="btn-whatsapp w-full py-4 text-lg"
            >
              📤 Kirim via WhatsApp
            </button>

            <p className="text-xs text-gray-400 text-center">
              Dengan mengklik kirim, Anda akan diarahkan ke WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}