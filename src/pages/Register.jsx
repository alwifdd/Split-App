import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Style input
  const inputStyle =
    "w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400";

  return (
    <div className="flex flex-col min-h-screen bg-white justify-center">
      <div className="px-8 pb-10">
        {/* JUDUL */}
        <h1
          className="font-bold text-gray-900 text-left mb-10 leading-tight"
          style={{ fontSize: "28px" }}
        >
          Hello, register to get Started!
        </h1>

        {/* INPUTS */}
        <div className="space-y-5">
          {/* === 1. INPUT USERNAME (BARU) === */}
          <div>
            <input
              type="text"
              placeholder="Username"
              style={{ fontSize: "14px" }}
              className={inputStyle}
            />
            {/* Note kecil (opsional) */}
            <p className="text-[10px] text-gray-400 mt-1 ml-1">
              *This will be your ID for friends to add you
            </p>
          </div>

          {/* 2. Email */}
          <input
            type="email"
            placeholder="Enter your email"
            style={{ fontSize: "14px" }}
            className={inputStyle}
          />

          {/* 3. Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              style={{ fontSize: "14px" }}
              className={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {/* 4. Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              style={{ fontSize: "14px" }}
              className={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>

          {/* TOMBOL REGISTER */}
          <button
            className="w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-6
                       bg-[#2E7D32] hover:bg-[#256D3A]
                       active:scale-[0.98] active:shadow-inner"
            style={{ fontSize: "16px" }}
          >
            Register
          </button>
        </div>

        {/* SOCIAL REGISTER */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>
            Or Register with
          </p>
          <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
            <FcGoogle className="text-2xl" />
          </button>
        </div>

        {/* LINK LOGIN */}
        <p
          className="text-center text-gray-500 mt-8"
          style={{ fontSize: "14px" }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#1E4720] font-bold cursor-pointer hover:underline"
          >
            Login Now
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
