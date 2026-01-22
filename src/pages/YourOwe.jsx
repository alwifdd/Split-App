import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const YourOwe = () => {
  const navigate = useNavigate();

  // === DATA DUMMY UTANG ===
  const debts = [
    {
      id: 1,
      creditorName: "Zaki",
      creditorAvatar: "https://i.pravatar.cc/150?img=11",
      groupName: "Mieayam Team",
      billTitle: "Mie Gacoan",
      date: "10 Nov 2025",
      amount: 15000,
    },
    {
      id: 2,
      creditorName: "Fuji",
      creditorAvatar: "https://i.pravatar.cc/150?img=5",
      groupName: "Coffe Team",
      billTitle: "Kopi Tuku",
      date: "09 Nov 2025",
      amount: 25000,
    },
    {
      id: 3,
      creditorName: "Keanu",
      creditorAvatar: "https://i.pravatar.cc/150?img=8",
      groupName: "Trip Bali",
      billTitle: "Sewa Villa",
      date: "01 Nov 2025",
      amount: 150000,
    },
  ];

  // Hitung Total Utang
  const totalOwe = debts.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* === TOP BAR === */}
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 active:opacity-60"
        >
          <IoChevronBack size={24} />
          <span className="font-semibold ml-1 text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-6">
        {/* === HEADER TOTAL === */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Owe</h1>

        {/* Card Total */}
        <div className="bg-[#1E4720] rounded-3xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Hiasan Circle */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white opacity-10 rounded-full"></div>

          <p className="text-sm font-medium opacity-80 mb-1">
            Total Unpaid Debt
          </p>
          <h2 className="text-3xl font-bold">
            Rp {totalOwe.toLocaleString("id-ID")}
          </h2>
          <p className="text-xs opacity-60 mt-4">
            Don't forget to pay your friends!
          </p>
        </div>

        {/* === LIST UTANG === */}
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Details</h3>
        <div className="space-y-4">
          {debts.map((debt) => (
            <div
              key={debt.id}
              // NAVIGASI KE BILL DETAIL BAWA DATA DUMMY
              onClick={() =>
                navigate("/bill-detail", {
                  state: {
                    title: debt.billTitle,
                    date: debt.date,
                    groupName: debt.groupName,
                    icon: "🧾",
                    creditor: {
                      name: debt.creditorName,
                      avatar: debt.creditorAvatar,
                    },
                    totalDebt: debt.amount,
                    // Dummy item detail yang dinamis sesuai jumlah utang
                    items: [
                      { name: "Item A", price: debt.amount * 0.6, qty: 1 },
                      { name: "Item B", price: debt.amount * 0.4, qty: 1 },
                    ],
                    taxService: 0,
                  },
                })
              }
              className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {/* Avatar Teman */}
                <div className="relative">
                  <img
                    src={debt.creditorAvatar}
                    alt={debt.creditorName}
                    className="w-12 h-12 rounded-full bg-gray-200 border border-gray-100"
                  />
                  {/* Icon Notif Kecil */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Info Utang */}
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {debt.creditorName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {debt.billTitle}{" "}
                    <span className="text-gray-300 mx-1">|</span>{" "}
                    {debt.groupName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{debt.date}</p>
                </div>
              </div>

              {/* Nominal */}
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">
                  - Rp {debt.amount.toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-gray-400">unpaid</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourOwe;
