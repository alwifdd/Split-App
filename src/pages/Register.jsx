import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, googleProvider } from "../firebase"; // Import Firebase
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400";

  // === 1. REGISTER EMAIL MANUAL ===
  const handleRegister = async () => {
    if (!email || !password) return alert("Please fill all fields");
    if (password !== confirmPassword) return alert("Passwords do not match!");

    setLoading(true);
    try {
      // Create user di Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      // Sukses -> Lanjut isi Username & Bank
      navigate("/set-username");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // === 2. REGISTER GOOGLE ===
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Sukses -> Lanjut isi Username & Bank
      navigate("/set-username");
    } catch (error) {
      console.error(error);
      alert("Google Sign In Failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white justify-center">
      <div className="px-8 pb-10">
        <h1
          className="font-bold text-gray-900 text-left mb-10 leading-tight"
          style={{ fontSize: "28px" }}
        >
          Hello, register to get Started!
        </h1>

        <div className="space-y-5">
          {/* INPUT EMAIL */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className={inputStyle}
          />

          {/* INPUT PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputStyle}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={inputStyle}
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>

          {/* BUTTON REGISTER */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-6 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2E7D32] hover:bg-[#256D3A] active:scale-[0.98]"}`}
            style={{ fontSize: "16px" }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </div>

        {/* SOCIAL REGISTER */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>
            Or Register with
          </p>
          <button
            onClick={handleGoogleLogin}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
          >
            <FcGoogle className="text-2xl" />
          </button>
        </div>

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
