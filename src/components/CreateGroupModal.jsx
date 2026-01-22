import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5"; // Pastikan IoClose diimport
import { FiPlus } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// FIREBASE
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const bgColors = [
    "#C8E6C9",
    "#C8B8E8",
    "#F4C6D7",
    "#F7C9A9",
    "#F2A974",
    "#FFF3B0",
    "#B69CCB",
    "#FFB6A6",
  ];

  const [isIconSet, setIsIconSet] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [groupEmoji, setGroupEmoji] = useState("");
  const [groupName, setGroupName] = useState("");

  const [queryText, setQueryText] = useState("");
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [creating, setCreating] = useState(false);

  const emojiInputRef = useRef(null);

  useEffect(() => {
    if (isIconSet && emojiInputRef.current) {
      emojiInputRef.current.focus();
    }
  }, [isIconSet]);

  const handleClose = () => {
    setIsIconSet(false);
    setColorIndex(0);
    setGroupEmoji("");
    setGroupName("");
    setFriends([]);
    setQueryText("");
    setSuggestions([]);
    onClose();
  };

  const prevColor = () =>
    setColorIndex((prev) => (prev === 0 ? bgColors.length - 1 : prev - 1));
  const nextColor = () =>
    setColorIndex((prev) => (prev === bgColors.length - 1 ? 0 : prev + 1));

  // === SEARCH USER (DIPERBAIKI) ===
  const handleSearch = async (e) => {
    const value = e.target.value;
    setQueryText(value);

    if (value.trim().length > 2) {
      setLoadingSearch(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("username", ">=", value.toLowerCase()),
          where("username", "<=", value.toLowerCase() + "\uf8ff"),
        );

        const querySnapshot = await getDocs(q);
        const results = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // === FIX PENTING: AMBIL UID DARI DOC.ID ===
          // Ini menjamin ID tidak undefined meskipun di data field tidak ada uid
          const userData = { ...data, uid: doc.id };

          if (
            userData.uid !== auth.currentUser.uid &&
            !friends.some((f) => f.uid === userData.uid)
          ) {
            results.push(userData);
          }
        });

        setSuggestions(results);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectFriend = (user) => {
    setFriends([...friends, user]);
    setQueryText("");
    setSuggestions([]);
  };

  const removeFriend = (uidToRemove) => {
    setFriends(friends.filter((f) => f.uid !== uidToRemove));
  };

  // === CREATE GROUP (DIPERBAIKI) ===
  const handleCreateGroup = async () => {
    if (!groupName || !groupEmoji || friends.length === 0) return;

    setCreating(true);
    try {
      const currentUser = auth.currentUser;

      const allMembers = [
        {
          uid: currentUser.uid,
          name: currentUser.displayName || "Me",
          username: "me",
          avatar: currentUser.photoURL || "default",
        },
        ...friends.map((f) => ({
          uid: f.uid, // Sekarang ini pasti ada isinya
          name: f.displayName || f.username,
          username: f.username,
          avatar: f.photoURL || "default",
        })),
      ];

      const memberIds = allMembers.map((m) => m.uid);

      // 1. SIMPAN GRUP
      const docRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        icon: groupEmoji,
        color: bgColors[colorIndex],
        createdBy: currentUser.uid,
        createdAt: new Date(),
        members: allMembers,
        memberIds: memberIds, // Array ini yang dipakai Home untuk filter
      });

      handleClose();

      // 2. NAVIGASI BAWA ID GRUP (PENTING BUAT BILLS & NOTIF)
      navigate("/split-bill", {
        state: {
          groupId: docRef.id, // <--- JANGAN HILANGKAN INI
          groupName,
          groupIcon: groupEmoji,
          members: friends,
        },
      });
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Gagal membuat grup");
    } finally {
      setCreating(false);
    }
  };

  const UserAvatar = ({ url, size = "w-8 h-8", iconSize = 14 }) => {
    if (url && url !== "default") {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-400`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-[400px] rounded-t-[30px] p-8 relative z-10 pb-10 min-h-[500px]"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              Create new group
            </h2>

            {/* INPUT ICON */}
            <div className="flex flex-col items-center mb-6">
              <label className="text-xs text-gray-900 font-semibold mb-3">
                Group Icon
              </label>
              {!isIconSet ? (
                <button
                  onClick={() => setIsIconSet(true)}
                  className="w-20 h-20 rounded-full bg-[#C8E6C9] flex items-center justify-center shadow-sm hover:bg-[#b2dfb3] transition-colors"
                >
                  <FiPlus className="text-4xl text-[#1E4720]" />
                </button>
              ) : (
                <div className="flex items-center gap-6">
                  <button
                    onClick={prevColor}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  >
                    <IoChevronBack />
                  </button>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-sm relative"
                    style={{ backgroundColor: bgColors[colorIndex] }}
                  >
                    <input
                      ref={emojiInputRef}
                      type="text"
                      value={groupEmoji}
                      onChange={(e) => setGroupEmoji(e.target.value)}
                      maxLength={2}
                      className="w-full h-full bg-transparent text-center text-4xl p-0 border-none outline-none caret-gray-700"
                      style={{ lineHeight: "1" }}
                    />
                  </div>
                  <button
                    onClick={nextColor}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  >
                    <IoChevronForward />
                  </button>
                </div>
              )}
            </div>

            {/* INPUT NAME */}
            <div className="mb-5">
              <label className="text-xs text-gray-900 font-semibold ml-1 block mb-2">
                Group name:
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter your group name"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            {/* SEARCH */}
            <div className="mb-20 relative">
              <label className="text-xs text-gray-900 font-semibold ml-1 block mb-2">
                Add your friends
              </label>
              <div className="relative z-20">
                <input
                  type="text"
                  value={queryText}
                  onChange={handleSearch}
                  placeholder="Search username (e.g. zaki)"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E7D32]"
                />

                {queryText.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                    {loadingSearch ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((user) => (
                        <div
                          key={user.uid}
                          onClick={() => selectFriend(user)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                        >
                          <UserAvatar url={user.photoURL} size="w-8 h-8" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {user.displayName}
                            </span>
                            <span className="text-xs text-gray-400">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400">
                        User not found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {friends.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {friends.map((friend, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 border border-gray-200 text-gray-700 text-xs pl-1 pr-2 py-1 rounded-full flex items-center gap-2 font-medium"
                    >
                      <UserAvatar
                        url={friend.photoURL}
                        size="w-5 h-5"
                        iconSize={10}
                      />
                      {friend.username}
                      <IoClose
                        className="cursor-pointer text-gray-400 hover:text-red-500 text-sm"
                        onClick={() => removeFriend(friend.uid)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <button
                onClick={handleCreateGroup}
                disabled={
                  !groupName || !groupEmoji || friends.length === 0 || creating
                }
                className={`w-full font-bold py-4 rounded-full shadow-lg transition-all ${groupName && groupEmoji && friends.length > 0 && !creating ? "bg-[#2E7D32] text-white active:scale-95 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
