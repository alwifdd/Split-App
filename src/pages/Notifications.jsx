import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import CreateGroupModal from "../components/CreateGroupModal";
import {
  FaChevronRight,
  FaUser,
  FaReceipt,
  FaMoneyBillWave,
  FaCircle,
} from "react-icons/fa";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc, // <--- Tambah ini
} from "firebase/firestore";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const notifRef = collection(db, "notifications");
          const q = query(notifRef, where("recipientId", "==", user.uid));

          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // SORTING MANUAL (Terbaru di atas)
          data.sort((a, b) => {
            const dateA = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt || 0);
            return dateB - dateA;
          });

          setNotifs(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // === SMART CLICK HANDLER ===
  const handleClickNotif = async (notif) => {
    // 1. UPDATE STATUS JADI 'READ' (Sudah dibaca)
    if (!notif.isRead) {
      try {
        const notifRef = doc(db, "notifications", notif.id);
        await updateDoc(notifRef, { isRead: true });
      } catch (err) {
        console.error("Gagal update status read", err);
      }
    }

    // 2. LOGIC NAVIGASI
    if (notif.type === "new_bill") {
      try {
        const billRef = doc(db, "bills", notif.billId);
        const billSnap = await getDoc(billRef);

        if (billSnap.exists()) {
          const billData = { id: billSnap.id, ...billSnap.data() };
          navigate("/bill-detail", { state: billData });
        } else {
          alert("Bill data no longer exists.");
        }
      } catch (error) {
        console.error(error);
      }
    } else if (notif.type === "payment_paid") {
      if (notif.groupId && notif.groupId !== "UNKNOWN") {
        navigate(`/group-detail/${notif.groupId}`);
      } else {
        // Auto Recovery Logic
        try {
          const targetGroupName = notif.groupName;
          if (targetGroupName) {
            const groupsRef = collection(db, "groups");
            const qGroup = query(
              groupsRef,
              where("name", "==", targetGroupName),
            );
            const groupSnap = await getDocs(qGroup);
            if (!groupSnap.empty) {
              navigate(`/group-detail/${groupSnap.docs[0].id}`);
              return;
            }
          }
          navigate("/home");
        } catch (err) {
          navigate("/home");
        }
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    // Cek apakah hari ini
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER */}
        <div className="px-6 pt-12 pb-4 bg-white shrink-0 z-10 border-b border-gray-50 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notify</h1>
          {/* Tombol Mark all read bisa ditaruh sini nanti */}
        </div>

        {/* LIST NOTIFICATIONS */}
        <div className="flex-1 overflow-y-auto px-0 pb-32">
          {notifs.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm px-6">
              No new notifications.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickNotif(item)}
                  // LOGIC WARNA: Kalau belum dibaca (isRead false) -> Biru Muda, kalau sudah -> Putih
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                    !item.isRead
                      ? "bg-blue-50/60"
                      : "bg-white active:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-4 pr-4">
                    <div className="relative shrink-0">
                      {item.senderAvatar && item.senderAvatar !== "default" ? (
                        <img
                          src={item.senderAvatar}
                          className="w-12 h-12 rounded-full object-cover bg-gray-200 border border-white"
                          alt="Sender"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <FaUser />
                        </div>
                      )}

                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ring-2 ring-white ${item.type === "payment_paid" ? "bg-green-500" : "bg-blue-500"}`}
                      >
                        {item.type === "payment_paid" ? (
                          <FaMoneyBillWave />
                        ) : (
                          <FaReceipt />
                        )}
                      </div>
                    </div>

                    <div>
                      <p
                        className={`text-sm leading-snug ${!item.isRead ? "text-gray-900 font-semibold" : "text-gray-600"}`}
                      >
                        <span className="font-bold text-black">
                          {item.senderName}
                        </span>{" "}
                        {item.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Indikator Titik Biru jika belum dibaca */}
                  {!item.isRead && (
                    <FaCircle className="text-blue-500 text-[8px] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        {/* BottomNav akan kita update di langkah selanjutnya untuk Badge */}
        <BottomNav
          activeTab="notification"
          onAddClick={() => setIsModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default Notifications;
