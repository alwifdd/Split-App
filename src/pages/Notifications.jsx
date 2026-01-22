import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import CreateGroupModal from "../components/CreateGroupModal";
import {
  FaChevronRight,
  FaUser,
  FaReceipt,
  FaMoneyBillWave,
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

  // === SMART CLICK HANDLER (AUTO-FIX GROUP ID) ===
  const handleClickNotif = async (notif) => {
    // 1. KASUS: ADA BILL BARU (User ditagih)
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
        console.error("Error opening bill:", error);
      }

      // 2. KASUS: PEMBAYARAN LUNAS (Notif ke Creator)
    } else if (notif.type === "payment_paid") {
      // Cek apakah ID Group valid
      if (notif.groupId && notif.groupId !== "UNKNOWN") {
        navigate(`/group-detail/${notif.groupId}`);
      } else {
        // === AUTO RECOVERY: JIKA GROUP ID HILANG ===
        console.log("Group ID missing, attempting recovery...");
        try {
          // Ambil nama group dari notif atau bill terkait
          const targetGroupName = notif.groupName;

          if (targetGroupName) {
            // Cari Group berdasarkan Nama
            const groupsRef = collection(db, "groups");
            const qGroup = query(
              groupsRef,
              where("name", "==", targetGroupName),
            );
            const groupSnap = await getDocs(qGroup);

            if (!groupSnap.empty) {
              const recoveredGroupId = groupSnap.docs[0].id;
              console.log("Group Recovered:", recoveredGroupId);
              navigate(`/group-detail/${recoveredGroupId}`);
              return;
            }
          }

          // Jika masih gagal juga
          alert("Group link is broken and could not be recovered.");
          navigate("/home");
        } catch (err) {
          console.error("Recovery failed:", err);
          navigate("/home");
        }
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER */}
        <div className="px-6 pt-12 pb-4 bg-white shrink-0 z-10 border-b border-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Notify
          </h1>
        </div>

        {/* LIST NOTIFICATIONS */}
        <div className="flex-1 overflow-y-auto px-0 pb-32">
          {notifs.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm px-6">
              No new notifications.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickNotif(item)}
                  className="px-6 py-4 flex items-center justify-between active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start gap-4 pr-4">
                    <div className="relative shrink-0">
                      {item.senderAvatar && item.senderAvatar !== "default" ? (
                        <img
                          src={item.senderAvatar}
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          alt="Sender"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <FaUser />
                        </div>
                      )}

                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${item.type === "payment_paid" ? "bg-green-500" : "bg-blue-500"}`}
                      >
                        {item.type === "payment_paid" ? (
                          <FaMoneyBillWave />
                        ) : (
                          <FaReceipt />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-bold">{item.senderName}</span>{" "}
                        {item.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <FaChevronRight className="text-gray-300 text-xs shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <BottomNav
          activeTab="notification"
          onAddClick={() => setIsModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default Notifications;
