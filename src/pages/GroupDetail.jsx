import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

// FIREBASE
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [memberStatus, setMemberStatus] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
      try {
        // 1. Fetch Group Data
        const groupRef = doc(db, "groups", id);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const groupData = { id: groupSnap.id, ...groupSnap.data() };
          setGroup(groupData);

          // 2. Fetch All Bills in this Group
          const billsRef = collection(db, "bills");
          const q = query(billsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);

          // DATA YANG KITA BUTUHKAN:
          // debtSummary: Berapa yg BELUM dibayar
          // spentSummary: Berapa TOTAL tagihan dia (History pengeluaran dia di grup)
          let debtSummary = {};
          let spentSummary = {};

          if (groupData.members) {
            groupData.members.forEach((m) => {
              debtSummary[m.uid] = 0;
              spentSummary[m.uid] = 0;
            });
          }

          querySnapshot.forEach((doc) => {
            const bill = doc.data();
            // Cek apakah bill milik grup ini (cek ID atau Nama untuk support data lama)
            if (bill.groupId === id || bill.groupName === groupData.name) {
              const splits = bill.splits || [];
              splits.forEach((split) => {
                const amount = split.totalAmount || split.amountOwed || 0;

                // 1. Hitung Total History Transaksi (Spent)
                // Kita catat semua nominal yang dibebankan ke member ini
                const currentSpent = spentSummary[split.uid] || 0;
                spentSummary[split.uid] = currentSpent + amount;

                // 2. Hitung Hutang Aktif (Unpaid)
                // Hanya jika status unpaid dan bukan yang nalangin (creator)
                if (split.status === "unpaid" && split.uid !== bill.createdBy) {
                  const currentDebt = debtSummary[split.uid] || 0;
                  debtSummary[split.uid] = currentDebt + amount;
                }
              });
            }
          });

          // 3. Gabungkan Data Member + Kalkulasi
          const statusList = groupData.members.map((m) => ({
            ...m,
            totalUnpaid: debtSummary[m.uid] || 0,
            totalSpent: spentSummary[m.uid] || 0, // Data baru untuk ditampilkan saat lunas
          }));

          // Urutkan: Yang punya hutang paling besar di atas
          statusList.sort((a, b) => b.totalUnpaid - a.totalUnpaid);

          setMemberStatus(statusList);
        } else {
          console.log("Group not found!");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Handle Make New Bill
  const handleMakeNewBill = () => {
    if (!group) return;
    navigate("/split-bill", {
      state: {
        groupId: group.id,
        groupName: group.name,
        groupIcon: group.icon,
        members: group.members || [],
      },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!group)
    return (
      <div className="flex justify-center items-center h-screen">
        Group not found
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[400px] bg-white min-h-screen relative flex flex-col">
        {/* === HEADER GROUP === */}
        <div className="px-6 pt-12 pb-8 flex flex-col items-center relative border-b border-gray-100">
          <button
            onClick={() => navigate("/home")}
            className="absolute left-6 top-12 p-2 -ml-2 text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
          >
            <IoChevronBack size={24} />
          </button>

          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-sm"
            style={{ backgroundColor: group.color || "#E8F5E9" }}
          >
            {group.icon}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            {group.members?.length} Members
          </p>
        </div>

        {/* === MONITORING SECTION === */}
        <div className="flex-1 px-6 pt-6 pb-24 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
            Member Status
          </h3>

          <div className="space-y-3">
            {memberStatus.map((member, idx) => {
              const hasDebt = member.totalUnpaid > 0;
              // Jika lunas, tampilkan total spent. Jika ngutang, tampilkan total hutang.
              const displayAmount = hasDebt
                ? member.totalUnpaid
                : member.totalSpent;

              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar url={member.avatar} size="w-12 h-12" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        {member.username || member.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {hasDebt ? "Outstanding debt" : "Total spent"}
                      </p>
                    </div>
                  </div>

                  {/* STATUS & NOMINAL */}
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${hasDebt ? "text-red-500" : "text-green-600"}`}
                    >
                      {/* LOGIC TAMPILAN ANGKA */}
                      {hasDebt
                        ? `- Rp ${displayAmount.toLocaleString("id-ID")}`
                        : `Rp ${displayAmount.toLocaleString("id-ID")}`}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        hasDebt
                          ? "bg-red-50 text-red-500"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {hasDebt ? "Unpaid" : "Settled"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === FIXED BOTTOM BUTTON === */}
        <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
          <button
            onClick={handleMakeNewBill}
            className="w-full py-4 rounded-full font-bold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#A6D4B3",
              color: "#1E4720",
            }}
          >
            Make new split bills
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
