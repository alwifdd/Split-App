import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import { FiPlus, FiBell } from "react-icons/fi"; // Pakai FiBell biar lebih cocok

const BottomNav = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk mengecek menu aktif
  const isActive = (path) => location.pathname === path;

  // Komponen Helper untuk Menu Item Biasa
  const NavItem = ({ path, icon: Icon, label }) => {
    const active = isActive(path);

    return (
      <button
        onClick={() => navigate(path)}
        className="flex flex-col items-center justify-center w-full h-full"
      >
        {/* Container Icon:
            - Jika aktif: Muncul background lingkaran warna #C1E2CA
            - Jika tidak: Transparan
        */}
        <div
          className={`p-2 rounded-full transition-all duration-300 ${
            active ? "bg-[#C1E2CA]" : "bg-transparent"
          }`}
        >
          <Icon className="text-2xl text-[#375E3A]" />
        </div>

        {/* Label Teks */}
        <span className={`text-[10px] mt-1 font-medium text-[#375E3A]`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    // Container Navbar
    <nav className="fixed bottom-0 w-full max-w-[400px] bg-white h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-[30px] px-6 pb-2">
      <div className="flex justify-between items-center h-full">
        {/* 1. HOME */}
        <NavItem path="/home" icon={FaHome} label="Home" />

        {/* 2. HISTORY */}
        <NavItem path="/history" icon={FaHistory} label="History" />

        {/* 3. TOMBOL PLUS (+) LONJONG
            - -mt-8: Biar dia naik ke atas (floating)
            - w-20 h-14: Ukuran lebar (lonjong)
            - rounded-[24px]: Sudut tumpul ala kapsul
            - shadow-lg: Efek bayangan
        */}
        <div className="relative -mt-10">
          <button
            onClick={onAddClick}
            className="w-24 h-14 bg-[#C1E2CA] rounded-[24px] flex items-center justify-center shadow-lg active:scale-95 transition-transform border-4 border-white"
          >
            {/* Ikon Plus Ukuran Besar & Tipis */}
            <FiPlus className="text-4xl text-[#375E3A]" strokeWidth={1.5} />
          </button>
        </div>

        {/* 4. NOTIFICATION */}
        <NavItem path="/notifications" icon={FiBell} label="Notification" />

        {/* 5. PROFILE */}
        <NavItem path="/profile" icon={FaUser} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNav;
