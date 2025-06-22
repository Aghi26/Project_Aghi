import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/init";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { news } from "@/utils/data/news";
import { useRouter } from "next/router";

const CustomDropdown = ({ selected, onChange, options }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-lg text-blue-900 font-bold"
      >
        {selected}
      </div>

      {open && (
        <ul className="absolute z-10 mt-1 w-40 bg-white border border-gray-300 rounded shadow-md">
          {options.map((option) => (
            <li
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {option.nama}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <p className="mb-4 text-lg font-semibold">
          Apakah Anda yakin ingin mengganti nama?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Iya
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

const Mypage = () => {
  const [userData, setUserData] = useState({
    name: "",
    location: "",
    birthdate: "",
    gender: "",
    placement: "",
  });

  const [loading, setLoading] = useState(true);
  const [selectedBand, setSelectedBand] = useState("");
  const [bandOptions, setBandOptions] = useState([]);
  const [bandDetails, setBandDetails] = useState({ nama: "", foto: "" });

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const router = useRouter();

  const fetchBandOptions = async () => {
    const bandRef = collection(db, "band");
    const snapshot = await getDocs(bandRef);
    const bands = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBandOptions(bands);
  };

  const fetchBandDetail = async (bandId) => {
    if (!bandId) return;
    try {
      const bandDoc = await getDoc(doc(db, "band", bandId));
      if (bandDoc.exists()) {
        setBandDetails(bandDoc.data());
      }
    } catch (error) {
      console.error("Gagal memuat data band:", error);
    }
  };

  const updateUserBand = async (bandId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        band: bandId,
      });
    } catch (error) {
      console.error("Gagal memperbarui band user:", error);
    }
  };

  const handleBandChange = (bandId) => {
    setSelectedBand(bandId);
    updateUserBand(bandId);
    fetchBandDetail(bandId);
  };

  const handleSaveName = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: nameInput,
      });
      setUserData((prev) => ({ ...prev, name: nameInput }));
      setIsEditingName(false);
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Gagal memperbarui nama:", error);
    }
  };

  const handlePlacementChange = async (value) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        placement: value,
      });
      setUserData((prev) => ({ ...prev, placement: value }));
    } catch (error) {
      console.error("Gagal memperbarui penempatan:", error);
    }
  };

  useEffect(() => {
    fetchBandOptions();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            let formattedDate = data.birthdate;
            if (data.birthdate && data.birthdate.includes("-")) {
              const [year, month, day] = data.birthdate.split("-");
              const monthNames = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember",
              ];
              formattedDate = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
            }

            setUserData({
              name: data.name || "",
              location: data.location || "",
              birthdate: formattedDate || "",
              gender: data.gender || "",
              placement: data.placement || "",
            });

            setNameInput(data.name || "");

            const savedBandId = data.band || "";
            if (savedBandId) {
              setSelectedBand(savedBandId);
              fetchBandDetail(savedBandId);
            }
          }
        } catch (error) {
          console.error("Gagal memuat data user:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNewsClick = () => {
    router.push("/news");
  };

  if (loading) {
    return <div className="p-6">Memuat data...</div>;
  }

  return (
    <div className="w-full pt-4 relative">
      {showConfirmModal && (
        <ConfirmationModal
          onConfirm={handleSaveName}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className="flex pt-6 pr-3">
        <div className="w-1/3 p-4 border-blue-400 border-2 rounded-t mr-4 ml-4 pt-5">
          <div className="bg-blue-400 -mt-5 -ml-4 -mr-4 pt-2 pb-2 pl-4 pr-4 rounded-t">
            <h3 className="font-bold text-center">News</h3>
          </div>
          <div className="pt-4">
            {news.map((newsItem, index) => (
              <div
                key={index}
                onClick={handleNewsClick}
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
              onClick={handleNewsClick}
              className="bg-blue-400 hover:bg-gray-300 py-2 px-4 rounded-3xl w-full cursor-pointer"
            >
              Selengkapnya
            </button>
          </div>
        </div>

        <div className="w-2/3 p-8 gap-8 border-2 border-sky-400 rounded-xl flex">
          <div className="flex flex-col items-center mr-6">
            <img
              src={bandDetails.foto || "https://placehold.co/400"}
              alt={`Logo ${bandDetails.nama || "Logo"}`}
              className="w-42 h-42 object-contain border-2 border-gray-300 mb-2"
            />
            Tertarik pada:&nbsp;
            <CustomDropdown
              selected={bandDetails.nama || "Pilih Band"}
              onChange={handleBandChange}
              options={bandOptions}
            />
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-xl font-semibold mb-1">Nama:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="border px-3 py-2 rounded text-base w-full"
                  readOnly={!isEditingName}
                  onClick={() => {
                    if (!isEditingName) setIsEditingName(true);
                  }}
                />
                {isEditingName && (
                  <>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(userData.name);
                      }}
                      className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                    >
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xl font-semibold mb-1">Lokasi:</label>
              <input
                type="text"
                value={userData.location}
                className="border px-3 py-2 rounded text-base w-full"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-xl font-semibold mb-1">Tanggal Lahir:</label>
              <input
                type="text"
                value={userData.birthdate}
                className="border px-3 py-2 rounded text-base w-full"
                readOnly
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-xl font-semibold mb-1">Jenis Kelamin:</label>
              <input
                type="text"
                value={userData.gender}
                className="border px-3 py-2 rounded text-base w-full"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-xl font-semibold mb-1">Lokasi yang diinginkan:</label>
              <CustomDropdown
                selected={userData.placement || "Pilih Wilayah"}
                onChange={handlePlacementChange}
                options={[
                  { id: "Jabodetabek", nama: "Jabodetabek" }, 
                  { id: "Jakarta", nama: "Jakarta" }, 
                  { id: "Depok", nama: "Depok" },
                  { id: "Bogor", nama: "Bogor" },
                  { id: "Bekasi", nama: "Bekasi" },
                  { id: "Bandung", nama: "Bandung" }
                ]}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Mypage;
