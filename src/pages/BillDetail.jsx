import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack, IoCheckmarkCircle } from "react-icons/io5";

const BillDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // === STATE MARK AS PAID ===
  const [isPaid, setIsPaid] = useState(false);

  // === DATA DUMMY FALLBACK (Utang ke Fuji) ===
  // Kalau data dari navigasi kosong, pake ini.
  const dummyFuji = {
    title: "Kopi Tuku",
    date: "09 Nov 2025",
    groupName: "Coffe Team",
    icon: "☕",
    creditor: { name: "Fuji", avatar: "https://i.pravatar.cc/150?img=5" },
    totalDebt: 25000,
    items: [
      { name: "Es Kopi Susu Tetangga", price: 20000, qty: 1 },
      { name: "Donat Kampung", price: 5000, qty: 1 },
    ],
    taxService: 0,
    status: "unpaid", // status awal
  };

  // Ambil data dari state atau pakai dummy
  const data = location.state || dummyFuji;

  const handleMarkAsPaid = () => {
    // Simulasi bayar
    setIsPaid(true);
    // Di real app, disini kirim request ke API
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* === TOP BAR === */}
      <div className="px-6 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 active:opacity-60"
        >
          <IoChevronBack size={24} />
          <span className="font-semibold ml-1 text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-6">
        {/* HEADER: STATUS & TOTAL */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">
            {data.icon}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-xs text-gray-400 mb-4">
            {data.groupName} • {data.date}
          </p>

          {/* Status Badge */}
          <div
            className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-4 ${
              isPaid
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isPaid ? (
              <>
                <IoCheckmarkCircle /> Paid
              </>
            ) : (
              "Unpaid Debt"
            )}
          </div>

          <h2 className="text-3xl font-bold text-[#1E4720]">
            Rp {data.totalDebt.toLocaleString("id-ID")}
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            You owe to{" "}
            <span className="font-bold text-gray-800">
              {data.creditor.name}
            </span>
          </p>
        </div>

        {/* RECEIPT CARD */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative mb-10">
          {/* Hiasan Kertas Struk */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 to-transparent opacity-50 rounded-t-3xl"></div>

          <h3 className="text-center font-bold text-sm text-gray-800 mb-6">
            Details
          </h3>

          {/* List Item yang Kita Pesan */}
          <div className="space-y-4 font-mono text-sm text-gray-700 border-b border-dashed border-gray-200 pb-4">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.name} {item.qty > 1 && `x${item.qty}`}
                </span>
                <span>
                  Rp {(item.price * item.qty).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          {/* Tax & Service */}
          <div className="pt-4 flex justify-between text-xs text-gray-400 font-mono">
            <span>Tax + Service</span>
            <span>Rp {data.taxService.toLocaleString("id-ID")}</span>
          </div>

          {/* Total Bawah */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-gray-900">
            <span>Total Amount</span>
            <span>Rp {data.totalDebt.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* === BOTTOM BUTTON === */}
      {/* Tombol hanya muncul kalau belum dibayar */}
      {!isPaid && (
        <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
          <button
            onClick={handleMarkAsPaid}
            className="w-full py-4 rounded-full font-bold text-white bg-[#375E3A] shadow-lg active:scale-[0.98] transition-transform hover:bg-[#2c4b2e]"
          >
            Mark as Paid
          </button>
        </div>
      )}
    </div>
  );
};

export default BillDetail;
