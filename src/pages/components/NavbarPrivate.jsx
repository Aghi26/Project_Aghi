import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/init";
import Image from "next/image";
import assets from "../../assets";

export default function NavbarPrivate() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-end p-4 font-bold">
        <Link href="/mypage" className="mr-2 hover:underline">
          My Page
        </Link> |{" "}
        <button onClick={handleSignOut} className="ml-2 hover:underline cursor-pointer">
          Sign Out
        </button>
      </div>

      <div className="flex justify-center items-center mt-6">
        <Image src={assets.logo} alt="Logo" width={100} height={100} />
      </div>

      <div className="flex justify-center p-3 mt-4 space-x-9 text-lg font-bold bg-blue-500">
        <Link href="/news" className="hover:text-white">News</Link>
        <Link href="/schedule" className="hover:text-white">Schedule</Link>
        <Link href="/galeri" className="hover:text-white">Galeri</Link>
      </div>
    </div>
  );
}
