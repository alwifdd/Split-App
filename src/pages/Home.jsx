import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import CreateGroupModal from "../components/CreateGroupModal";
import { FaChevronRight, FaUser } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === REAL STATE ===
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [bills, setBills] = useState([]);
  const [totalOwe, setTotalOwe] = useState(0);
  const [loading, setLoading] = useState(true);

  // === HELPER: AVATAR ===
  const UserAvatar = ({ url, size, iconSize = 12, className = "" }) => {
    if (url && url !== "default" && url.startsWith("http")) {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border border-white ${className}`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 border border-white flex items-center justify-center text-gray-400 ${className}`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  // === FETCH DATA ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // A. PROFILE
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data());
          }

          // B. GROUPS (SORTED DESCENDING)
          const groupsRef = collection(db, "groups");
          const qGroups = query(
            groupsRef,
            where("memberIds", "array-contains", user.uid),
          );

          const groupSnap = await getDocs(qGroups);
          const groupData = [];
          groupSnap.forEach((doc) => {
            groupData.push({ id: doc.id, ...doc.data() });
          });

          // Sort Group Terbaru (Paling Kiri)
          groupData.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setGroups(groupData);

          // C. BILLS & HITUNG UTANG
          const billsRef = collection(db, "bills");
          const qBills = query(
            billsRef,
            where("involvedMemberIds", "array-contains", user.uid),
          );

          const billSnap = await getDocs(qBills);
          const billData = [];
          let calculatedDebt = 0;

          billSnap.forEach((doc) => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date();
            const dateStr = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            // Hitung Utang Saya
            const mySplit = data.splits?.find((s) => s.uid === user.uid);
            if (mySplit && mySplit.status === "unpaid") {
              calculatedDebt += mySplit.totalAmount || 0;
            }

            billData.push({
              id: doc.id,
              ...data,
              date: dateStr,
              icon: data.groupIcon,
              members: data.splits.map((s) => ({ avatar: s.avatar })),

              // DATA UNTUK HALAMAN DETAIL (PENTING: Masukkan semua data)
              fullData: {
                id: doc.id,
                ...data, // Copy semua field (splits, groupName, dll)
                isExisting: true,
              },
            });
          });

          billData.sort((a, b) => b.createdAt - a.createdAt);
          setBills(billData);
          setTotalOwe(calculatedDebt);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white scroll-smooth">
      <div className="pb-32">
        {/* HEADER */}
        <div className="px-6 pt-12 pb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserAvatar
              url={currentUser?.photoURL}
              size="w-12 h-12"
              iconSize={20}
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Welcome back,</span>
              <h1 className="text-base font-bold text-gray-900">
                {currentUser?.displayName || currentUser?.username || "User"}
              </h1>
            </div>
          </div>
        </div>

        {/* YOUR GROUP */}
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Your Group</h2>
            {groups.length > 0 && (
              <span
                onClick={() => navigate("/groups")}
                className="text-xs text-gray-400 cursor-pointer hover:text-green-700"
              >
                See more
              </span>
            )}
          </div>
          {groups.length === 0 ? (
            <div
              onClick={() => setIsModalOpen(true)}
              className="w-full h-[120px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-colors"
            >
              <FiPlus className="text-3xl mb-2" />
              <span className="text-xs font-medium">
                Create your first group
              </span>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {groups.slice(0, 3).map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/group-detail/${group.id}`)}
                  className="min-w-[140px] h-[160px] rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm relative cursor-pointer active:scale-95 transition-transform"
                  style={{ backgroundColor: group.color || "#C8E6C9" }}
                >
                  <div className="text-3xl">{group.icon}</div>
                  <div className="text-center w-full">
                    <p className="font-medium text-sm text-[#1E4720] truncate w-full px-1">
                      {group.name}
                    </p>
                    <div className="flex -space-x-2 mt-2 justify-center">
                      {group.members &&
                        group.members
                          .slice(0, 3)
                          .map((m, idx) => (
                            <UserAvatar
                              key={idx}
                              url={m.avatar}
                              size="w-6 h-6"
                              iconSize={10}
                              className="border-2 border-white/50"
                            />
                          ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OVERVIEW */}
        <div className="px-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Overview</h2>
          <div
            onClick={() => navigate("/your-owe")}
            className="w-full border border-gray-100 rounded-3xl p-6 shadow-sm text-center bg-white relative cursor-pointer active:scale-95 transition-transform hover:shadow-md"
          >
            <span className="bg-green-100 text-[#1E4720] text-[10px] px-3 py-1 rounded-full font-medium uppercase">
              Your owe
            </span>
            <h3 className="text-3xl font-bold text-gray-900 mt-3">
              Rp {totalOwe.toLocaleString("id-ID")}
            </h3>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
              <span className="flex items-center">
                Check details <FaChevronRight className="ml-1 text-[10px]" />
              </span>
            </div>
          </div>
        </div>

        {/* RECENT BILLS */}
        <div className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Recent bills</h2>
          </div>
          {bills.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-400">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* TAMPILKAN HANYA 5 TAGIHAN TERBARU */}
              {bills.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex justify-between items-start"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg">
                      {bill.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800 truncate max-w-[120px]">
                        {bill.title}
                      </p>
                      <p className="text-xs text-gray-400">{bill.date}</p>
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
                      onClick={() => navigate("/bill-detail", { state: bill })}
                      className="text-[10px] text-green-600 border border-green-200 px-3 py-1 rounded-full mt-4 hover:bg-green-50 active:scale-95 transition-all"
                    >
                      view detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <BottomNav onAddClick={() => setIsModalOpen(true)} />
    </div>
  );
};

export default Home;
