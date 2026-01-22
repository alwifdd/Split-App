import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const YourOwe = () => {
  const navigate = useNavigate();
  const [debtList, setDebtList] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper Avatar
  const UserAvatar = ({ url, size }) => {
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
        <FaUser size={14} />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const billsRef = collection(db, "bills");
          const q = query(
            billsRef,
            where("involvedMemberIds", "array-contains", user.uid),
          );

          const snapshot = await getDocs(q);
          const debts = [];
          let calculatedTotal = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const splits = data.splits || [];
            const mySplit = splits.find((s) => s.uid === user.uid);

            if (mySplit && mySplit.status === "unpaid") {
              if (data.createdBy !== user.uid) {
                const amount = mySplit.totalAmount || 0;
                calculatedTotal += amount;

                const dateObj = data.createdAt?.toDate
                  ? data.createdAt.toDate()
                  : new Date();
                const dateStr = dateObj.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                debts.push({
                  id: doc.id,
                  title: data.title || "Split Bill",
                  groupName: data.groupName,
                  creditorName: data.creatorName || "Friend",
                  amount: amount,
                  date: dateStr,
                  fullData: { id: doc.id, ...data },
                  creditorAvatar:
                    splits.find((s) => s.uid === data.createdBy)?.avatar ||
                    "default",
                });
              }
            }
          });

          debts.sort((a, b) => b.amount - a.amount);
          setDebtList(debts);
          setTotalDebt(calculatedTotal);
        } catch (error) {
          console.error("Error fetching debts:", error);
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
      <div className="h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    // FIX SCROLL: Gunakan h-screen dan overflow-hidden di container utama
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER AREA (FIXED) */}
        <div className="px-6 pt-8 pb-4 shrink-0 bg-white z-10">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-gray-800 mb-4 active:opacity-60"
          >
            <IoChevronBack size={24} />
            <span className="font-bold ml-2 text-lg">Your Owe</span>
          </button>
        </div>

        {/* SCROLLABLE CONTENT (Card + List) */}
        {/* Gunakan flex-1 dan overflow-y-auto agar area ini saja yang scroll */}
        <div className="flex-1 overflow-y-auto px-6 pb-20">
          {/* TOTAL CARD */}
          <div className="bg-[#1E4720] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>

            <p className="text-sm font-medium opacity-80 mb-1">
              Total Unpaid Debt
            </p>
            <h2 className="text-3xl font-bold">
              Rp {totalDebt.toLocaleString("id-ID")}
            </h2>
            <p className="text-[10px] mt-4 opacity-60">
              Don't forget to pay your friends!
            </p>
          </div>

          {/* LIST DEBTS */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Details</h3>

            {debtList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                You are debt free! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {debtList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate("/bill-detail", { state: item.fullData })
                    }
                    className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar url={item.creditorAvatar} size="w-10 h-10" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {item.creditorName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {item.title} | {item.groupName}
                        </p>
                        <p className="text-[10px] text-gray-300">{item.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">
                        - Rp {item.amount.toLocaleString("id-ID")}
                      </p>
                      <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                        unpaid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spacer Bawah agar item terakhir tidak mepet layar */}
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
};

export default YourOwe;
