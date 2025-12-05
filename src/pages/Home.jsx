import React, { useState } from "react";
import BottomNav from "../components/BottomNav";
import CreateGroupModal from "../components/CreateGroupModal";
import { FaChevronRight } from "react-icons/fa";
import logoIcon from "../assets/logo-icon.png"; // Pake avatar dummy nanti

const Home = () => {
  // State untuk kontrol Modal Popup
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-24">
      {" "}
      {/* pb-24 biar konten gak ketutup nav */}
      {/* === 1. HEADER === */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" />
          </div>

          {/* Hello + Nama dalam 1 baris */}
          <h1 className="text-base font-bold text-gray-900">
            Hello, <span className="font-bold">Paijo</span>
          </h1>
        </div>
      </div>
      {/* === 2. YOUR GROUP (Horizontal Scroll) === */}
      <div className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Your Group</h2>
          <span className="text-xs text-gray-400">See more</span>
        </div>

        {/* Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {/* Card 1: Mieayam (Hijau) */}
          <div className="min-w-[140px] h-[160px] bg-[#C8E6C9] rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm relative">
            <div className="text-3xl">🍜</div>
            <div className="text-center">
              <p className="font-medium text-sm text-[#1E4720]">Mieayam Team</p>
              {/* Avatar tumpuk */}
              <div className="flex -space-x-2 mt-2 justify-center">
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#C8E6C9]"
                  src="https://i.pravatar.cc/150?img=1"
                  alt=""
                />
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#C8E6C9]"
                  src="https://i.pravatar.cc/150?img=2"
                  alt=""
                />
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#C8E6C9]"
                  src="https://i.pravatar.cc/150?img=3"
                  alt=""
                />
              </div>
            </div>
          </div>

          {/* Card 2: Coffee (Kuning) */}
          <div className="min-w-[140px] h-[160px] bg-[#FFF59D] rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm relative">
            <div className="text-3xl">☕</div>
            <div className="text-center">
              <p className="font-medium text-sm text-yellow-900">Coffe Team</p>
              <div className="flex -space-x-2 mt-2 justify-center">
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#FFF59D]"
                  src="https://i.pravatar.cc/150?img=4"
                  alt=""
                />
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#FFF59D]"
                  src="https://i.pravatar.cc/150?img=5"
                  alt=""
                />
              </div>
            </div>
          </div>

          {/* Card 3: Belanja (Oranye) */}
          <div className="min-w-[140px] h-[160px] bg-[#FFCCBC] rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm relative">
            <div className="text-3xl">🛒</div>
            <div className="text-center">
              <p className="font-medium text-sm text-orange-900">
                Belanja bareng
              </p>
              <div className="flex -space-x-2 mt-2 justify-center">
                <img
                  className="w-6 h-6 rounded-full border-2 border-[#FFCCBC]"
                  src="https://i.pravatar.cc/150?img=8"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* === 3. OVERVIEW (Debt Card) === */}
      <div className="px-6 mb-8">
        <h2 className="font-bold text-gray-800 mb-4">Overview</h2>
        <div className="w-full border border-gray-100 rounded-3xl p-6 shadow-sm text-center bg-white relative">
          <span className="bg-green-100 text-[#1E4720] text-[10px] px-3 py-1 rounded-full font-medium uppercase">
            Your owe
          </span>
          <h3 className="text-3xl font-bold text-gray-900 mt-3">Rp. 15.000</h3>
          <div className="flex items-center justify-center mt-2 text-xs text-gray-400 cursor-pointer">
            Show detail <FaChevronRight className="ml-1 text-[10px]" />
          </div>
        </div>
      </div>
      {/* === 4. RECENT BILLS === */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Recent bills</h2>
          <span className="text-xs text-gray-400 flex items-center">
            View more <FaChevronRight className="ml-1 text-[10px]" />
          </span>
        </div>

        <div className="space-y-3">
          {/* Bill Item 1 */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">
                🍜
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  Mie Gacoan
                </p>
                <p className="text-xs text-gray-400">10 November 2025</p>
                <div className="flex -space-x-2 mt-2">
                  <img
                    className="w-5 h-5 rounded-full border border-white"
                    src="https://i.pravatar.cc/150?img=1"
                    alt=""
                  />
                  <img
                    className="w-5 h-5 rounded-full border border-white"
                    src="https://i.pravatar.cc/150?img=2"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#1E4720]">Rp. 250.000</p>
              <span className="text-[10px] text-green-600 border border-green-200 px-2 py-0.5 rounded-full mt-6 inline-block">
                view detail
              </span>
            </div>
          </div>

          {/* Bill Item 2 */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                ☕
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Kopi Tuku</p>
                <p className="text-xs text-gray-400">09 November 2025</p>
                <div className="flex -space-x-2 mt-2">
                  <img
                    className="w-5 h-5 rounded-full border border-white"
                    src="https://i.pravatar.cc/150?img=4"
                    alt=""
                  />
                  <img
                    className="w-5 h-5 rounded-full border border-white"
                    src="https://i.pravatar.cc/150?img=5"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#1E4720]">Rp. 350.000</p>
              <span className="text-[10px] text-green-600 border border-green-200 px-2 py-0.5 rounded-full mt-6 inline-block">
                view detail
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* === MODAL POPUP === */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* === BOTTOM NAV === */}
      {/* Kita oper fungsi untuk membuka modal ke tombol (+) */}
      <BottomNav onAddClick={() => setIsModalOpen(true)} />
    </div>
  );
};

export default Home;
