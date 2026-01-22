import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import CreateGroupModal from "../components/CreateGroupModal";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper Avatar
  const UserAvatar = ({ url, size }) => {
    if (url && url !== "default" && url.startsWith("http")) {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border-2 border-white`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-400`}
      >
        <FaUser size={10} />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Query Group dimana user menjadi member
          const groupsRef = collection(db, "groups");
          const q = query(
            groupsRef,
            where("memberIds", "array-contains", user.uid),
          );

          const querySnapshot = await getDocs(q);
          const groupData = [];

          querySnapshot.forEach((doc) => {
            groupData.push({ id: doc.id, ...doc.data() });
          });

          // Sort Terbaru di atas
          groupData.sort((a, b) => {
            const tA = a.createdAt?.seconds || 0;
            const tB = b.createdAt?.seconds || 0;
            return tB - tA;
          });

          setGroups(groupData);
        } catch (error) {
          console.error("Error fetching groups:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading)
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER */}
        <div className="px-6 pt-12 pb-6 shrink-0 z-10 bg-white">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-gray-800 mb-6 active:opacity-60"
          >
            <IoChevronBack size={24} />
            <span className="font-bold ml-2 text-lg">Your Groups</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 pb-20">
          <div className="grid grid-cols-2 gap-4">
            {/* CARD CREATE NEW */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FiPlus size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-green-600">
                Create New
              </span>
            </div>

            {/* LIST GROUPS REAL */}
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/group-detail/${group.id}`)}
                className="aspect-square rounded-3xl p-5 flex flex-col justify-between cursor-pointer shadow-sm active:scale-95 transition-transform relative overflow-hidden"
                style={{ backgroundColor: group.color || "#E8F5E9" }}
              >
                {/* Icon Besar */}
                <div className="text-4xl">{group.icon}</div>

                {/* Info */}
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-800 truncate w-full mb-2">
                    {group.name}
                  </p>

                  {/* Member Avatars */}
                  <div className="flex -space-x-2 justify-center">
                    {group.members &&
                      group.members
                        .slice(0, 3)
                        .map((m, i) => (
                          <UserAvatar key={i} url={m.avatar} size="w-6 h-6" />
                        ))}
                    {group.members && group.members.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-[8px] font-bold text-gray-600 border-2 border-white">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer Bawah */}
          <div className="h-10"></div>
        </div>

        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default GroupList;
