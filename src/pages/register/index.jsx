import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/init";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import { news } from "@/utils/data/news";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        location,
        birthdate,
        gender,
        email: user.email,
        createdAt: new Date().toISOString()
      });

      router.push("/mypage");
    } catch (error) {
      alert("Registrasi gagal: " + error.message);
    }
  };

  const handleSelengkapnyaClick = () => router.push("/news");

  return (
    <div className="w-full pt-4 relative">
      <h1 className="text-4xl font-extrabold text-center text-blue-800">Register</h1>
      <div className="flex pt-6 pr-3">
        <div className="w-1/3 p-4 border-blue-400 border-2 rounded-t mr-4 ml-4 pt-5">
          <div className="bg-blue-400 -mt-5 -ml-4 -mr-4 pt-2 pb-2 pl-4 pr-4 rounded-t">
            <h3 className="font-bold text-center">News</h3>
          </div>
          <div className="pt-4">
            {news.map((newsItem, index) => (
              <div
                key={index}
                onClick={handleSelengkapnyaClick}
                className="mb-4 text-left cursor-pointer p-2 rounded hover:bg-gray-100"
              >
                <h4 className="font-semibold">{newsItem.title}</h4>
                <p className="pb-4">{newsItem.date}</p>
                <hr />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSelengkapnyaClick}
              className="bg-blue-400 hover:bg-gray-300 py-2 px-4 rounded-3xl w-full cursor-pointer"
            >
              Selengkapnya
            </button>
          </div>
        </div>

        <div className="w-2/3 p-8 border-2 border-sky-400 rounded-xl">
          <div className="mb-4">
            <label className="block text-xl font-bold mb-2">Nama</label>
            <input
              type="text"
              placeholder="Nama lengkap"
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xl font-bold mb-2">Lokasi</label>
            <input
              type="text"
              placeholder="Kota / Provinsi"
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xl font-bold mb-2">Tanggal Lahir</label>
            <input
              type="date"
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xl font-bold mb-2">Jenis Kelamin</label>
            <select
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-xl font-bold mb-2">Alamat email</label>
            <input
              id="email"
              type="email"
              placeholder="Alamat email"
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-xl font-bold mb-2">Kata sandi</label>
            <input
              id="password"
              type="password"
              placeholder="Kata sandi"
              className="w-full p-3 border-2 border-blue-400 rounded-xl"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleRegister}
            className="bg-blue-500 cursor-pointer text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
