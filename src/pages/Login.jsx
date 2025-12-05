import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logoIcon from "../assets/logo-icon.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* === HEADER HIJAU === 
          - Tinggi sekitar 35-40% layar.
          - Logo polos di tengah.
      */}
      <div className="bg-[#1E4720] h-[45%] w-full rounded-b-[40px] flex items-center justify-center relative shadow-lg z-0">
        <img
          src={logoIcon}
          alt="Logo"
          style={{ width: "250px", height: "250px" }}
          className="object-contain mt-6"
        />
      </div>

      {/* === FORM AREA === 
          - Container putih yang naik sedikit (-mt-8) atau nempel pas di bawah. 
          - Di screenshot desain, kontennya ada di area putih di bawah header.
      */}
      <div className="flex-1 px-8 pt-10 pb-6 flex flex-col bg-white">
        {/* JUDUL */}
        <h2
          className="font-semibold text-gray-900 text-left mb-8 leading-snug"
          style={{ fontSize: "24px" }}
        >
          Welcome Back, Glad to see
          <br />
          you again!
        </h2>

        {/* INPUTS CONTAINER */}
        <div className="space-y-4">
          {/* Input Email 
              - Style kotak: bg-gray-100 (abu muda), rounded-lg (sudut tumpul).
          */}
          <input
            type="email"
            placeholder="Enter your email"
            style={{ fontSize: "14px" }}
            className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400"
          />

          {/* Input Password & Mata */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              style={{ fontSize: "14px" }}
              className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400"
            />
            {/* Tombol Mata */}
            {/* TOMBOL LOGIN */}
            <button
              onClick={() => navigate("/home")} // <--- TAMBAHANNYA DI SINI
              className="w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-4
             bg-[#2E7D32] hover:bg-[#256D3A]
             active:scale-[0.98] active:shadow-inner"
              style={{ fontSize: "16px" }}
            >
              Login
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <span className="text-xs text-gray-400 cursor-pointer hover:text-[#1E4720]">
              Forgot Password?
            </span>
          </div>
        </div>

        {/* SOCIAL LOGIN */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>
            Or Login with
          </p>
          <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
            <FcGoogle className="text-2xl" />
          </button>
        </div>

        {/* FOOTER: REGISTER LINK */}
        {/* mt-auto biar dia kedorong ke paling bawah kalau layar tinggi */}
        <div className="mt-auto pt-6 text-center">
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[#1E4720] font-bold cursor-pointer hover:underline"
            >
              Register Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
