import Link from "next/link";
import Image from "next/image";
import assets from "../../assets";

export default function NavbarPublic() {
  return (
    <div>
      <nav className="flex justify-end p-4 font-bold">
        <Link href="/login" className="mr-2 hover:underline">Login</Link> |{" "}
        <Link href="/register" className="ml-2 hover:underline">Register</Link>
      </nav>
      <div className="flex justify-center items-center mt-6">
        <Image
          src={assets.logo}
          alt="Logo"
          width={100}
          height={100}
        />
      </div>
      <div className="flex justify-center p-3 mt-4 space-x-9 text-lg font-bold bg-blue-500">
        <Link href="/news" className="hover:text-white">News</Link>
        <Link href="/schedule" className="hover:text-white">Schedule</Link>
        <Link href="/galeri" className="hover:text-white">Galeri</Link>
      </div>
    </div>
  );
}
