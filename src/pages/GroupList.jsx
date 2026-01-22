import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const GroupList = () => {
  const navigate = useNavigate();

  const groups = [
    { id: 1, name: "Mieayam Team", icon: "🍜", color: "#C8E6C9" },
    { id: 2, name: "Konser", icon: "🎫", color: "#C8B8E8" },
    { id: 3, name: "Karoke", icon: "🎤", color: "#FFCCBC" },
    { id: 4, name: "Coffee Run", icon: "☕", color: "#FFF59D" },
    { id: 5, name: "Trip Bali", icon: "🏖️", color: "#B3E5FC" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 pt-8 pb-10">
      <div className="flex items-center mb-8 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 p-2 -ml-2 text-gray-800"
        >
          <IoChevronBack size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-xl text-gray-900">
          Group
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => navigate(`/group-detail/${group.id}`)}
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform aspect-square"
            style={{ backgroundColor: group.color }}
          >
            <div className="text-4xl">{group.icon}</div>
            <p className="font-semibold text-sm text-gray-800 text-center">
              {group.name}
            </p>
            <div className="flex -space-x-2">
              <img
                className="w-6 h-6 rounded-full border-2 border-white/50"
                src={`https://i.pravatar.cc/150?img=${group.id + 10}`}
                alt=""
              />
              <img
                className="w-6 h-6 rounded-full border-2 border-white/50"
                src={`https://i.pravatar.cc/150?img=${group.id + 12}`}
                alt=""
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
