import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import CreateGroupModal from "../components/CreateGroupModal";
import { FaUser } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const History = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper Avatar
  const UserAvatar = ({ url, size, iconSize = 12 }) => {
    if (url && url !== "default" && url.startsWith("http")) {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border border-gray-100`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 border border-gray-100 flex items-center justify-center text-gray-400`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const billsRef = collection(db, "bills");
          // Ambil bills dimana user terlibat
          const qBills = query(
            billsRef,
            where("involvedMemberIds", "array-contains", user.uid),
          );

          const billSnap = await getDocs(qBills);
          const billData = [];

          billSnap.forEach((doc) => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date();

            // Format Tanggal
            const dateStr = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            billData.push({
              id: doc.id,
              ...data,
              date: dateStr,
              rawDate: dateObj, // Untuk sorting
              icon: data.groupIcon || "🧾",
              members: data.splits
                ? data.splits.map((s) => ({ avatar: s.avatar }))
                : [],
              // Pastikan fullData ada untuk detail page
              fullData: {
                id: doc.id,
                ...data,
                isExisting: true,
              },
            });
          });

          // Sort dari yang terbaru
          billData.sort((a, b) => b.rawDate - a.rawDate);
          setBills(billData);
        } catch (error) {
          console.error("Error fetching history:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Filter Search
  const filteredBills = bills.filter(
    (bill) =>
      bill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.groupName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="h-screen bg-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    // UBAH 1: Gunakan h-screen dan overflow-hidden pada container utama
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER (Tetap Diam di Atas) */}
        <div className="px-6 pt-12 pb-4 bg-white shrink-0 z-10 border-b border-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">History</h1>

          {/* Search Bar */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-3.5 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search bill or group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* LIST BILLS (Area Scrollable) */}
        {/* UBAH 2: flex-1 agar mengisi sisa ruang, overflow-y-auto agar bisa discroll */}
        {/* pb-32 memberi ruang ekstra di bawah agar item terakhir tidak tertutup nav */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-3">
          {filteredBills.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No transaction history found.
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white border border-gray-100 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-start"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center text-lg">
                    {bill.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 truncate max-w-[120px]">
                      {bill.title || bill.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {bill.date} • {bill.groupName}
                    </p>

                    {/* Avatar Members */}
                    <div className="flex -space-x-2 mt-2">
                      {bill.members &&
                        bill.members
                          .slice(0, 3)
                          .map((m, idx) => (
                            <UserAvatar
                              key={idx}
                              url={m.avatar}
                              size="w-5 h-5"
                              iconSize={8}
                            />
                          ))}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <p className="text-xs font-bold text-[#1E4720]">
                    Rp {bill.totalAmount?.toLocaleString("id-ID")}
                  </p>
                  <button
                    // Pastikan kirim bill.fullData (jika ada) atau bill itu sendiri
                    onClick={() =>
                      navigate("/bill-detail", { state: bill.fullData || bill })
                    }
                    className="text-[10px] text-green-600 border border-green-200 px-3 py-1 rounded-full mt-4 hover:bg-green-50 active:scale-95 transition-all"
                  >
                    view detail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <BottomNav onAddClick={() => setIsModalOpen(true)} />
      </div>
    </div>
  );
};

export default History;
