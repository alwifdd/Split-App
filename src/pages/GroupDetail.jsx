import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const GroupDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Fuji",
      status: "paid",
      amount: 0,
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 2,
      name: "Faiz",
      status: "owe",
      amount: 13733,
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 3,
      name: "Keanu",
      status: "owe",
      amount: 25000,
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  ]);

  const handleMarkAsPaid = (memberId) => {
    if (window.confirm("Mark this debt as paid?")) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, status: "paid", amount: 0 } : m,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-8 pb-4 flex items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 p-2 -ml-2 text-gray-800"
        >
          <IoChevronBack size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-xl text-gray-900">
          Detail
        </h1>
      </div>

      <div className="px-6 mb-8">
        <h2 className="font-bold text-lg text-gray-800">Mieayam Team</h2>
        <p className="text-xs text-gray-500">
          billsid: {12442626 + parseInt(id || 0)}
        </p>
      </div>

      <div className="px-6 flex-1 space-y-3 overflow-y-auto">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() =>
              member.status === "owe" ? handleMarkAsPaid(member.id) : null
            }
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              member.status === "paid"
                ? "bg-[#C8E6C9] text-[#1E4720]"
                : "bg-[#D32F2F] text-white cursor-pointer hover:opacity-90 shadow-md"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white/20"
              />
              <span className="text-sm font-medium">
                {member.status === "paid"
                  ? `${member.name} has paid`
                  : `${member.name} owe to you`}
              </span>
            </div>
            {member.status === "owe" && (
              <span className="text-xs font-bold">
                Rp. {member.amount.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pb-10 pt-4 space-y-3 bg-white mt-auto">
        <button className="w-full py-4 rounded-full font-semibold bg-[#C1E2CA] text-[#1E4720] active:scale-[0.98]">
          Make new split bills
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 rounded-full font-bold bg-[#375E3A] text-white active:scale-[0.98] shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default GroupDetail;
