import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/pages/components/AdminLayout";
import withAdmin from "@/pages/components/withAdmin";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/init";
import { useToast } from "@/pages/components/Toast";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersList = [];
        usersSnap.forEach((u) =>
          usersList.push({
            uid: u.id,
            displayName: u.data().name || u.data().displayName || "Anonymous",
            email: u.data().email || "",
            role: u.data().role || "user",
            photoURL: u.data().photoURL || "",
            createdAt: u.data().createdAt || "-",
            isActive: u.data().isActive !== false,
          })
        );
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleRole = async (uid, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal mengubah role: " + error.message);
    }
  };

  const toggleActive = async (uid, currentActive) => {
    try {
      await updateDoc(doc(db, "users", uid), { isActive: !currentActive });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Gagal mengubah status: " + error.message);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {users.length} user ({users.filter((u) => u.role === "admin").length} admin,{" "}
            {users.filter((u) => u.role === "user").length} user biasa)
          </p>
        </div>

        <div className="relative max-w-md">
          <input type="text" placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Bergabung</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
                            {user.displayName ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                          </div>
                          <div><p className="font-medium text-gray-900">{user.displayName}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                          {user.role === "admin" ? "🛡️ Admin" : "👤 User"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive ? "✅ Aktif" : "❌ Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleRole(user.uid, user.role)}
                            className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                            {user.role === "admin" ? "👤 Jadikan User" : "🛡️ Jadikan Admin"}
                          </button>
                          <button onClick={() => toggleActive(user.uid, user.isActive)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${user.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                            {user.isActive ? "❌ Nonaktifkan" : "✅ Aktifkan"}
                          </button>
                          <button onClick={() => setSelectedUser(user)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition">👁️ Detail</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <p className="text-3xl mb-2">👥</p>
                      <p className="text-sm">{search ? `Tidak ada user untuk "${search}"` : "Belum ada user"}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl modal-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Detail User</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                    {selectedUser.displayName ? selectedUser.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedUser.displayName}</h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900 font-mono text-xs mt-1 break-all">{selectedUser.uid}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedUser.role === "admin" ? "🛡️ Admin" : "👤 User"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedUser.isActive ? "✅ Aktif" : "❌ Nonaktif"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Bergabung</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedUser.createdAt}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { toggleRole(selectedUser.uid, selectedUser.role); setSelectedUser((prev) => ({ ...prev, role: prev.role === "admin" ? "user" : "admin" })); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                  {selectedUser.role === "admin" ? "👤 Jadikan User" : "🛡️ Jadikan Admin"}
                </button>
                <button onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Tutup</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdmin(AdminUsers);
