import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/init";

const SidebarLink = ({ href, icon, label, active }) => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
          active
            ? "bg-blue-50 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const path = router.pathname;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/admin/events", icon: "📋", label: "Events" },
    { href: "/admin/news", icon: "📰", label: "News" },
    { href: "/admin/gallery", icon: "🖼️", label: "Galeri" },
    { href: "/admin/users", icon: "👥", label: "Users" },
    { href: "/admin/orders", icon: "📦", label: "Orders" },
    { href: "/admin/packages", icon: "🎫", label: "Packages" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-gray-900 text-white h-14 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          🛡️ Jakarta Admin
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/home" className="text-gray-400 hover:text-white transition">
            ← Lihat Website
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r min-h-screen p-4 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={path === item.href || path.startsWith(item.href + "/")}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around py-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center px-3 py-1 rounded-lg ${
                  path === item.href ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}