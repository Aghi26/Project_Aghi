import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/init";

const withAdmin = (WrappedComponent) => {
  return function AdminProtected(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setIsAdmin(true);
            } else {
              router.push("/admin");
            }
          } catch (error) {
            router.push("/admin");
          }
        } else {
          router.push("/admin");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Memeriksa akses...</p>
          </div>
        </div>
      );
    }

    if (!isAdmin) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAdmin;