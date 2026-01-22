import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa"; // <--- Import ini

const SplitSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { groupName, groupIcon, members, memberOrders, tax, service } =
    location.state || {
      groupName: "Test Group",
      groupIcon: "🧪",
      members: [],
      memberOrders: [],
      tax: 0,
      service: 0,
    };

  const servicePerPerson = service / (members.length || 1);
  let grandTotal = 0;
  const formatRp = (num) => "Rp " + Math.floor(num).toLocaleString("id-ID");

  const handleDone = () => {
    // Logic Create Bill Real nanti disini...
    // Sementara balik ke home
    navigate("/home");
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
                  {/* Pakai UserAvatar */}
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
            billsid: {Date.now()}
          </p>

          <div className="space-y-6 font-mono text-sm text-gray-700">
            {memberOrders.map((order) => {
              const userSubtotal = order.items.reduce(
                (acc, item) =>
                  acc +
                  (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0),
                0,
              );
              const userTax = (userSubtotal * tax) / 100;
              const userTotal = userSubtotal + userTax + servicePerPerson;
              grandTotal += userTotal;

              if (userSubtotal === 0) return null;

              return (
                <div
                  key={order.memberId}
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
            <p className="text-center text-[10px] text-gray-400 mt-4">
              Notification sent to all members successfully.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
        <button
          onClick={handleDone}
          className="w-full py-4 rounded-full font-bold text-white bg-[#375E3A] shadow-lg active:scale-[0.98] transition-transform hover:bg-[#2c4b2e]"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SplitSuccess;
