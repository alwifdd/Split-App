import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logoIcon from "../assets/logo-icon.png";
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State untuk loading saat tombol ditekan
  const [loading, setLoading] = useState(false);

  // State untuk loading awal (pengecekan user)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // === FUNGSI CEK DATA USER & NAVIGASI ===
  const checkUserAndNavigate = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        navigate("/home");
      } else {
        navigate("/set-username");
      }
    } catch (error) {
      console.error("Error checking user db:", error);
      // Kalau error db, tetap lempar ke home atau login
      navigate("/home");
    }
  };

  // === 1. AUTO-LOGIN LISTENER (SOLUSI BUG) ===
  // Kode ini akan jalan otomatis saat aplikasi dibuka
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Jika Firebase menemukan user yg tersimpan di browser
        await checkUserAndNavigate(user);
      } else {
        // Jika benar-benar tidak ada user, matikan loading & tampilkan form
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // === 2. LOGIN MANUAL ===
  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Tidak perlu panggil checkUserAndNavigate di sini karena useEffect di atas akan mendeteksinya otomatis
    } catch (error) {
      console.error(error);
      alert("Login Failed: " + error.message);
      setLoading(false);
    }
  };

  // === 3. LOGIN GOOGLE ===
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Sama, useEffect akan menangkap perubahan auth
    } catch (error) {
      console.error(error);
      alert("Google Login Failed");
    }
  };

  const inputStyle =
    "w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400";

  // === TAMPILAN LOADING (SPLASH SCREEN) ===
  // Agar user tidak melihat form login dulu baru dilempar (kedip), kita tahan di layar hijau sebentar
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full bg-[#1E4720] flex items-center justify-center">
        <img
          src={logoIcon}
          alt="Logo"
          style={{ width: "150px", height: "150px" }}
          className="object-contain animate-pulse"
        />
      </div>
    );
  }

  // === TAMPILAN UTAMA (FORM LOGIN) ===
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER HIJAU */}
      <div className="bg-[#1E4720] h-[40%] w-full rounded-b-[40px] flex items-center justify-center relative shadow-lg z-0">
        <img
          src={logoIcon}
          alt="Logo"
          style={{ width: "250px", height: "250px" }}
          className="object-contain mt-6"
        />
      </div>

      {/* FORM AREA */}
      <div className="flex-1 px-8 pt-10 pb-12 flex flex-col bg-white">
        <h2
          className="font-semibold text-gray-900 text-left mb-8 leading-snug"
          style={{ fontSize: "24px" }}
        >
          Welcome back,
          <br />
          <span className="font-bold text-[#1E4720]">
            Glad to see you again!
          </span>
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email / Username"
            className={inputStyle}
          />

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

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-6 
               ${loading ? "bg-gray-400" : "bg-[#2E7D32] hover:bg-[#256D3A] active:scale-[0.98]"}`}
            style={{ fontSize: "16px" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>
            Or Login with
          </p>
          <button
            onClick={handleGoogleLogin}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
          >
            <FcGoogle className="text-2xl" />
          </button>
        </div>

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
