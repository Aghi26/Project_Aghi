import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/init";
import "@/firebase/init";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/news");
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
