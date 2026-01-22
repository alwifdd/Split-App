import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

// FIREBASE
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const SplitSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);

  // Ambil data
  const state = location.state || {};
  const {
    groupName,
    groupIcon,
    members,
    memberOrders,
    tax,
    service,
    groupId, // Pastikan groupId juga diambil dari state jika ada, untuk notifikasi
    isExisting,
  } = state;

  // Fallback data kosong biar gak error
  if (!location.state) return null;

  const servicePerPerson = service / (members.length || 1);
  let grandTotal = 0;
  const formatRp = (num) => "Rp " + Math.floor(num).toLocaleString("id-ID");

  // === HELPER: Prepare Data Utang ===
  const calculateSplits = () => {
    const splits = [];
    memberOrders.forEach((order) => {
      const subtotal = order.items.reduce(
        (acc, item) =>
          acc + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0),
        0,
      );

      if (subtotal === 0) return;

      const userTax = (subtotal * tax) / 100;
      const totalUser = subtotal + userTax + servicePerPerson;

      // Tentukan status
      const isMe =
        order.memberId === auth.currentUser?.uid || order.memberId === "me";

      splits.push({
        uid: order.memberId === "me" ? auth.currentUser.uid : order.memberId,
        name: order.memberName,
        avatar:
          members.find(
            (m) =>
              m.uid === order.memberId ||
              (order.memberId === "me" && m.uid === auth.currentUser?.uid),
          )?.avatar || "default",
        totalAmount: totalUser,
        status: isMe ? "paid" : "unpaid",
        items: order.items,
      });
    });
    return splits;
  };

  // === LOGIC TOMBOL DONE ===
  const handleDone = async () => {
    // 1. JIKA INI BILL LAMA (VIEW DETAIL) -> LANGSUNG BALIK
    if (isExisting) {
      navigate("/home");
      return;
    }

    // 2. JIKA INI BILL BARU -> SIMPAN KE DB
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      const splitsData = calculateSplits();

      // Hitung grandTotal di sini untuk memastikan nilainya benar sebelum disimpan
      const calculatedGrandTotal = splitsData.reduce(
        (acc, split) => acc + split.totalAmount,
        0,
      );

      const billData = {
        groupId: groupId || "UNKNOWN", // Gunakan groupId dari state atau default
        groupName: groupName,
        groupIcon: groupIcon,
        title: `Bill at ${groupName}`,
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || "User",
        createdAt: new Date(),
        totalAmount: calculatedGrandTotal,
        tax: parseFloat(tax),
        service: parseFloat(service),
        splits: splitsData,
        involvedMemberIds: members.map(
          (m) => m.uid || (m.id === "me" ? currentUser.uid : m.id),
        ),
      };

      // Simpan Bill
      const billRef = await addDoc(collection(db, "bills"), billData);

      // === LOGIC NOTIFIKASI ===
      const notifPromises = splitsData.map(async (split) => {
        // Jangan kirim notif ke diri sendiri (pembuat bill)
        if (split.uid === currentUser.uid) return;

        await addDoc(collection(db, "notifications"), {
          recipientId: split.uid,
          senderId: currentUser.uid,
          senderName: currentUser.displayName || "User",
          senderAvatar: currentUser.photoURL || "default",
          type: "new_bill",
          groupId: groupId || "UNKNOWN",
          groupName: groupName,
          billId: billRef.id,
          message: `sent you a bill in the '${groupName}' group.`,
          isRead: false,
          createdAt: new Date(),
        });
      });

      await Promise.all(notifPromises);
      // === END LOGIC NOTIFIKASI ===

      navigate("/home");
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Gagal menyimpan tagihan");
    } finally {
      setSaving(false);
    }
  };

  // === COMPONENT AVATAR ===
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
      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-12">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-20 h-20 rounded-full bg-[#C1E2CA] flex items-center justify-center text-4xl mb-4 shadow-sm">
            {groupIcon}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-6">{groupName}</h1>
          <div className="w-full">
            <h3 className="text-left font-bold text-gray-800 mb-3 ml-1">
              Members
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {members.map((m, idx) => (
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

        {/* RECEIPT CARD */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative mb-10">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 to-transparent opacity-50 rounded-t-3xl"></div>
          <h2 className="text-center font-bold text-lg mb-1 text-gray-800">
            Bill Receipt
          </h2>
          <p className="text-center text-xs text-gray-400 mb-6">
            {isExisting ? "Viewing History" : `billsid: ${Date.now()}`}
          </p>

          <div className="space-y-6 font-mono text-sm text-gray-700">
            {memberOrders.map((order, i) => {
              const userSubtotal = order.items.reduce(
                (acc, item) =>
                  acc +
                  (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0),
                0,
              );
              const userTax = (userSubtotal * tax) / 100;
              const userTotal = userSubtotal + userTax + servicePerPerson;

              // Reset grandTotal saat render ulang (hanya visual, kalkulasi DB pakai calculateSplits)
              if (i === 0) grandTotal = 0;
              grandTotal += userTotal;

              if (userSubtotal === 0) return null;

              return (
                <div
                  key={order.memberId || i}
                  className="border-b border-dashed border-gray-300 pb-4 last:border-0"
                >
                  <p className="font-bold text-[#1E4720] mb-2 text-base">
                    {order.memberName}
                  </p>
                  {order.items.map(
                    (item, idx) =>
                      item.name && (
                        <div
                          key={idx}
                          className="flex justify-between mb-1 text-xs"
                        >
                          <span>
                            {item.name} {item.qty > 1 && `x${item.qty}`}
                          </span>
                          <span>{formatRp(item.price * item.qty)}</span>
                        </div>
                      ),
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
            {!isExisting && (
              <p className="text-center text-[10px] text-gray-400 mt-4">
                Notification will be sent to members.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
        <button
          onClick={handleDone}
          disabled={saving}
          className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-[0.98] 
                ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#375E3A] hover:bg-[#2c4b2e]"}
            `}
        >
          {saving ? "Saving..." : "Done"}
        </button>
      </div>
    </div>
  );
};

export default SplitSuccess;
