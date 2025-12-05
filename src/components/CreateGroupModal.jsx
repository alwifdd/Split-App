import React, { useState, useRef, useEffect } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// === DATA DUMMY TEMAN (Nanti ini dari Database/Firebase) ===
const DUMMY_USERS = [
  {
    id: 1,
    name: "Zaki",
    username: "zaki_99",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Fuji",
    username: "fuji_anti",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "Fadil",
    username: "fadil_jaidi",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "Keanu",
    username: "keanu_agl",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 5,
    name: "Anya",
    username: "anya_ger",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 6,
    name: "Deddy",
    username: "corbuzier",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const CreateGroupModal = ({ isOpen, onClose }) => {
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

  // State untuk Input & Suggestion
  const [query, setQuery] = useState(""); // Apa yang diketik user
  const [friends, setFriends] = useState([]); // Siapa yang sudah dipilih
  const [suggestions, setSuggestions] = useState([]); // List dropdown

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
    setQuery("");
    onClose();
  };

  const prevColor = () =>
    setColorIndex((prev) => (prev === 0 ? bgColors.length - 1 : prev - 1));
  const nextColor = () =>
    setColorIndex((prev) => (prev === bgColors.length - 1 ? 0 : prev + 1));

  // === LOGIC PENCARIAN TEMAN ===
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      // Filter user berdasarkan nama ATAU username
      // DAN pastikan user itu belum dimasukkan ke list friends
      const filtered = DUMMY_USERS.filter(
        (user) =>
          (user.name.toLowerCase().includes(value.toLowerCase()) ||
            user.username.toLowerCase().includes(value.toLowerCase())) &&
          !friends.some((f) => f.username === user.username) // Cek duplikasi
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Pilih teman dari dropdown
  const selectFriend = (user) => {
    setFriends([...friends, user]); // Tambah ke list
    setQuery(""); // Kosongkan input
    setSuggestions([]); // Tutup dropdown
  };

  // Hapus teman dari tag
  const removeFriend = (usernameToRemove) => {
    setFriends(friends.filter((f) => f.username !== usernameToRemove));
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
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) handleClose();
            }}
            className="bg-white w-full max-w-[400px] rounded-t-[30px] p-8 relative z-10 pb-10 min-h-[500px]" // Tambah min-h biar dropdown muat
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing"></div>

            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              Create new group
            </h2>

            {/* === ICON GROUP === */}
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
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300"
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

            {/* === GROUP NAME === */}
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

            {/* === ADD FRIENDS (AUTOCOMPLETE) === */}
            <div className="mb-20 relative">
              {" "}
              {/* Relative penting buat Dropdown */}
              <label className="text-xs text-gray-900 font-semibold ml-1 block mb-2">
                Add your friends
              </label>
              <div className="relative z-20">
                <input
                  type="text"
                  value={query}
                  onChange={handleSearch}
                  placeholder="Type name (e.g., Zaki)"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E7D32]"
                />

                {/* === DROPDOWN SUGGESTION === */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                    {suggestions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => selectFriend(user)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                      >
                        {/* Avatar */}
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full bg-gray-200"
                        />

                        {/* Nama & Username */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* === LIST TEMAN TERPILIH (TAGS) === */}
              {friends.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {friends.map((friend, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 border border-gray-200 text-gray-700 text-xs pl-1 pr-2 py-1 rounded-full flex items-center gap-2 font-medium"
                    >
                      <img
                        src={friend.avatar}
                        className="w-5 h-5 rounded-full"
                        alt=""
                      />
                      {friend.name}
                      <IoClose
                        className="cursor-pointer text-gray-400 hover:text-red-500 text-sm"
                        onClick={() => removeFriend(friend.username)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <button
                className={`w-full font-bold py-4 rounded-full shadow-lg transition-all ${
                  groupName && groupEmoji
                    ? "bg-[#2E7D32] text-white active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
