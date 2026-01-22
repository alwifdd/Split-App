import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import { FiPlus, FiBell } from "react-icons/fi";

// FIREBASE IMPORTS (Hanya ini tambahan importnya)
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const BottomNav = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // === 1. LOGIC HITUNG NOTIFIKASI REAL-TIME ===
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Ambil notifikasi milik saya yang isRead == false
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      where("isRead", "==", false),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size); // Update angka badge
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk mengecek menu aktif
  const isActive = (path) => location.pathname === path;

  // Komponen Helper untuk Menu Item Biasa
  // (Saya tambah prop 'badge' di sini)
  const NavItem = ({ path, icon: Icon, label, badge }) => {
    const active = isActive(path);

    return (
      <button
        onClick={() => navigate(path)}
        className="flex flex-col items-center justify-center w-full h-full"
      >
        {/* Container Icon:
            - Ditambah 'relative' biar badge bisa diposisikan absolute
        */}
        <div
          className={`p-2 rounded-full transition-all duration-300 relative ${
            active ? "bg-[#C1E2CA]" : "bg-transparent"
          }`}
        >
          <Icon className="text-2xl text-[#375E3A]" />

          {/* === 2. TAMPILAN BADGE MERAH === */}
          {badge > 0 && (
            <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-white">
              {badge > 99 ? "99+" : badge}
            </div>
          )}
        </div>

        {/* Label Teks */}
        <span className={`text-[10px] mt-1 font-medium text-[#375E3A]`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    // Container Navbar (Sama Persis)
    <nav className="fixed bottom-0 w-full max-w-[400px] bg-white h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-[30px] px-6 pb-2">
      <div className="flex justify-between items-center h-full">
        {/* 1. HOME */}
        <NavItem path="/home" icon={FaHome} label="Home" />

        {/* 2. HISTORY */}
        <NavItem path="/history" icon={FaHistory} label="History" />

        {/* 3. TOMBOL PLUS (+) LONJONG (Sama Persis) */}
        <div className="relative -mt-10">
          <button
            onClick={onAddClick}
            className="w-24 h-14 bg-[#C1E2CA] rounded-[24px] flex items-center justify-center shadow-lg active:scale-95 transition-transform border-4 border-white"
          >
            {/* Ikon Plus Ukuran Besar & Tipis */}
            <FiPlus className="text-4xl text-[#375E3A]" strokeWidth={1.5} />
          </button>
        </div>

        {/* 4. NOTIFICATION (Disini kita oper unreadCount) */}
        <NavItem
          path="/notifications"
          icon={FiBell}
          label="Notification"
          badge={unreadCount}
        />

        {/* 5. PROFILE */}
        <NavItem path="/profile" icon={FaUser} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNav;
