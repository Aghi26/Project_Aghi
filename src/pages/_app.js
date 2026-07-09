import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/init";
import NavbarPublic from "./components/NavbarPublic";
import NavbarPrivate from "./components/NavbarPrivate";
import { ToastProvider } from "./components/Toast";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const isAdminRoute = router.pathname.startsWith("/admin");

  return (
    <ToastProvider>
      {!isAdminRoute && (user ? <NavbarPrivate /> : <NavbarPublic />)}
      <div key={router.pathname} className="page-enter">
        <Component {...pageProps} />
      </div>
    </ToastProvider>
  );
}
