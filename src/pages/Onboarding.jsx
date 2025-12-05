import React from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import logoFull from "../assets/logo-full.png";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* === HEADER HIJAU (DIPENDEKIN) === 
          Ubah h-[55%] jadi h-[45%] biar gak kepanjangan
      */}
      <div className="bg-[#1E4720] h-[45%] w-full rounded-b-[50px] flex items-center justify-center relative shadow-lg">
        <img
          src={logoFull}
          alt="Split Yuk"
          style={{ width: "220px", height: "auto" }}
          className="object-contain mt-8" // mt-8 biar logo agak turun dikit
        />
      </div>

      {/* === KONTEN BAWAH === */}
      <div className="flex-1 flex flex-col px-8 pt-10 items-center">
        {/* TEXT SECTION */}
        {/* Tambah mb-10 supaya ada jarak jauh ke tombol */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-gray-800" style={{ fontSize: "24px" }}>
            Fair Splitting Better Living
          </h2>

          <p
            className="text-gray-500 mt-3 leading-relaxed font-normal" // <--- font-normal (Reguler)
            style={{ fontSize: "14px" }}
          >
            Manage your shared payments smarter
          </p>
        </div>

        {/* BUTTON SECTION */}
        <div className="w-full space-y-4">
          {/* TOMBOL LOGIN (SEMIBOLD) */}
          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 rounded-full font-semibold transition-all shadow-sm
                       bg-[#C1E2CA] text-[#1E4720]
                       active:bg-[#A6D4B3] active:text-[#16381A] active:shadow-inner active:scale-[0.98]"
            style={{ fontSize: "16px" }}
          >
            Login to your account
          </button>

          {/* TOMBOL CREATE ACCOUNT (SEMIBOLD) */}
          <button
            onClick={() => navigate("/register")}
            className="w-full py-4 rounded-full font-semibold transition-all shadow-sm
                       bg-[#256D3A] text-[#FFFFFF]
                       active:shadow-inner active:scale-[0.98]"
            style={{ fontSize: "16px" }}
          >
            Create new account
          </button>

          {/* GOOGLE SIGNUP */}
          <div className="pt-2 flex flex-col items-center">
            <p className="text-gray-400 mb-3" style={{ fontSize: "12px" }}>
              Or Signup with
            </p>
            <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
              <FcGoogle className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
