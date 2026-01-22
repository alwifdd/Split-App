import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

// FIREBASE IMPORTS
import { doc, updateDoc, addDoc, collection, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const BillDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [markingPaid, setMarkingPaid] = useState(false);

  // === 1. AMBIL DATA ===
  const data = location.state || {};
  const currentUser = auth.currentUser;

  // Safety Check
  if (!location.state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-gray-500 mb-4">Data tidak ditemukan.</p>
        <button
          onClick={() => navigate("/home")}
          className="bg-green-700 text-white px-6 py-2 rounded-full font-bold text-sm"
        >
          Kembali ke Home
        </button>
      </div>
    );
  }

  // === 2. MAPPING DATA ===
  const memberOrders = data.splits || data.memberOrders || [];
  const groupName = data.groupName || "Group";
  const groupIcon = data.groupIcon || data.icon || "🧾";
  const tax = parseFloat(data.tax || 0);
  const service = parseFloat(data.service || 0);

  const membersList = memberOrders.map((m) => ({
    name: m.name || m.memberName || "User",
    avatar: m.avatar || "default",
    uid: m.uid || m.memberId,
  }));

  const servicePerPerson = service / (membersList.length || 1);
  let grandTotal = 0;
  const formatRp = (num) => "Rp " + Math.floor(num).toLocaleString("id-ID");

  const dateObj = data.date
    ? typeof data.date === "string"
      ? data.date
      : new Date(data.date.seconds * 1000).toLocaleDateString("id-ID")
    : "Recently";

  // === 3. LOGIC MARK AS PAID ===
  const mySplit = memberOrders.find(
    (m) => (m.uid || m.memberId) === currentUser?.uid,
  );
  const isMyStatusUnpaid = mySplit && mySplit.status === "unpaid";
  const isCreator = data.createdBy === currentUser?.uid;

  const handleMarkAsPaid = async () => {
    if (!currentUser) return;
    setMarkingPaid(true);

    try {
      const billId = data.id;
      const billRef = doc(db, "bills", billId);

      // Ambil Data Terbaru dari DB
      const billSnap = await getDoc(billRef);

      if (billSnap.exists()) {
        const billDataDB = billSnap.data();
        const splits = billDataDB.splits;

        // Cari data saya di DB untuk ambil nama yang benar
        const mySplitInDB = splits.find((s) => s.uid === currentUser.uid);
        // Prioritas Nama: Nama di Bill > Nama Auth > "Member"
        const senderName =
          mySplitInDB?.name || currentUser.displayName || "Member";

        // Update Status jadi 'paid'
        const updatedSplits = splits.map((s) => {
          if (s.uid === currentUser.uid) {
            return { ...s, status: "paid" };
          }
          return s;
        });

        // Simpan ke DB
        await updateDoc(billRef, { splits: updatedSplits });

        // Kirim Notifikasi ke Creator
        if (billDataDB.createdBy !== currentUser.uid) {
          // Pastikan groupId ada. Jika bill lama gak punya groupId, pakai default atau dari state
          const targetGroupId = billDataDB.groupId || data.groupId || "UNKNOWN";

          await addDoc(collection(db, "notifications"), {
            recipientId: billDataDB.createdBy,
            senderId: currentUser.uid,
            senderName: senderName, // <--- SUDAH DIPERBAIKI (Bukan "User" lagi)
            senderAvatar: currentUser.photoURL || "default",
            type: "payment_paid",
            groupId: targetGroupId, // <--- Menggunakan ID yang lebih aman
            groupName: billDataDB.groupName,
            billId: billId,
            message: `has paid their part in the '${billDataDB.groupName}' group.`,
            isRead: false,
            createdAt: new Date(),
          });
        }

        navigate(-1);
      }
    } catch (error) {
      console.error("Error marking paid:", error);
      alert("Gagal mengupdate status.");
    } finally {
      setMarkingPaid(false);
    }
  };

  const UserAvatar = ({ url, size, iconSize = 20 }) => {
    if (url && url !== "default" && url.startsWith("http")) {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border-2 border-white shadow-sm`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-400`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-8 pb-2 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-8 p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IoChevronBack size={24} />
        </button>
        <h1 className="text-center font-bold text-lg text-gray-900 pt-1">
          Bill Details
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-4">
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-20 h-20 rounded-full bg-[#C1E2CA] flex items-center justify-center text-4xl mb-4 shadow-sm">
            {groupIcon}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{groupName}</h1>
          <p className="text-xs text-gray-400 mb-6">{dateObj}</p>

          <div className="w-full">
            <h3 className="text-left font-bold text-gray-800 mb-3 ml-1">
              Members
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {membersList.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center min-w-[60px]"
                >
                  <UserAvatar url={m.avatar} size="w-14 h-14" />
                  <span className="text-xs font-medium text-gray-600 mt-2 text-center truncate w-full">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative mb-10">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 to-transparent opacity-50 rounded-t-3xl"></div>
          <h2 className="text-center font-bold text-lg mb-1 text-gray-800">
            Bill Receipt
          </h2>
          <p className="text-center text-xs text-gray-400 mb-6">
            Viewing History
          </p>

          <div className="space-y-6 font-mono text-sm text-gray-700">
            {memberOrders.map((order, i) => {
              const items = order.items || [];
              const userSubtotal = items.reduce(
                (acc, item) =>
                  acc +
                  (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0),
                0,
              );
              const displaySubtotal =
                userSubtotal > 0 ? userSubtotal : order.totalAmount || 0;
              const userTax = (displaySubtotal * tax) / 100;
              const userTotal = displaySubtotal + userTax + servicePerPerson;

              if (i === 0) grandTotal = 0;
              grandTotal += userTotal;
              if (displaySubtotal === 0 && items.length === 0) return null;

              return (
                <div
                  key={i}
                  className="border-b border-dashed border-gray-300 pb-4 last:border-0"
                >
                  <p className="font-bold text-[#1E4720] mb-2 text-base">
                    {order.name || order.memberName}
                  </p>
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between mb-1 text-xs"
                      >
                        <span>
                          {item.name} {item.qty > 1 && `x${item.qty}`}
                        </span>
                        <span>{formatRp(item.price * item.qty)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-1">
                      Items detail not available
                    </p>
                  )}
                  <div className="flex justify-between text-gray-400 text-[10px] mt-2 italic">
                    <span>Tax ({tax}%) + Service</span>
                    <span>{formatRp(userTax + servicePerPerson)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 mt-2">
                    <span>Subtotal</span>
                    <span>{formatRp(userTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-[#F5FBF6] -mx-6 -mb-6 p-6 rounded-b-3xl border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Grand Total</span>
              <span className="text-2xl font-bold text-[#1E4720]">
                {formatRp(grandTotal)}
              </span>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-4">
              Recorded on {dateObj}
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
        {isMyStatusUnpaid && !isCreator ? (
          <button
            onClick={handleMarkAsPaid}
            disabled={markingPaid}
            className="w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-[0.98] bg-[#1E4720] hover:bg-[#163418]"
          >
            {markingPaid ? "Processing..." : "Mark as Paid"}
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-[0.98] bg-[#375E3A] hover:bg-[#2c4b2e]"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default BillDetail;
