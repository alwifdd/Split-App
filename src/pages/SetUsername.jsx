import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";
import { auth, db } from "../firebase";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

const SetUsername = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // FORM STATE
  const [username, setUsername] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // CEK LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async () => {
    if (username.length < 4) {
      alert("Username minimal 4 karakter!");
      return;
    }

    if (!bankName || !accountNumber) {
      alert("Mohon lengkapi data Bank / E-Wallet!");
      return;
    }

    setLoading(true);

    try {
      // 1. CEK USERNAME UNIK
      const q = query(
        collection(db, "users"),
        where("username", "==", username),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Username already taken!");
        setLoading(false);
        return;
      }

      // 2. TENTUKAN FOTO AWAL
      // Login email/password → default
      // Login Google → foto Google
      const isPasswordLogin = user.providerData.some(
        (provider) => provider.providerId === "password",
      );

      const initialPhoto = isPasswordLogin
        ? "default"
        : user.photoURL || "default";

      // 3. SIMPAN KE FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        username: username,
        photoURL: initialPhoto,
        bankDetails: {
          bankName: bankName,
          accountNumber: accountNumber,
        },
        createdAt: new Date(),
      });

      // 4. KE HOME
      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400 font-medium";

  return (
    <div className="flex flex-col min-h-screen bg-white justify-center px-8">
      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-[#1E4720] rounded-[24px] rotate-45 flex items-center justify-center shadow-lg">
          <img
            src={logoIcon}
            alt="Logo"
            className="-rotate-45 w-[60px] h-[60px] object-contain"
          />
        </div>
      </div>

      {/* TITLE */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Complete Profile</h2>
        <p className="text-gray-500 text-sm mt-2">
          Set your username & payment details
        </p>
      </div>

      <div className="space-y-4">
        {/* USERNAME */}
        <div>
          <label className="text-xs font-bold text-[#1E4720] ml-1 mb-2 block">
            CHOOSE USERNAME
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
              placeholder="cool_guy"
              style={{ paddingLeft: "35px" }}
              className={inputStyle}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 ml-1">
            *Minimal 4 karakter & unik
          </p>
        </div>

        {/* PAYMENT */}
        <div>
          <label className="text-xs font-bold text-[#1E4720] ml-1 mb-2 block">
            PAYMENT DETAILS
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Bank / E-Wallet (BCA, Dana, GoPay)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={`${inputStyle} w-1/2`}
            />
            <input
              type="number"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={`${inputStyle} w-1/2`}
            />
          </div>
          <p className="text-[10px] text-gray-400 ml-1">
            *Digunakan agar teman bisa transfer langsung
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-6
            ${
              username.length > 3 && bankName && accountNumber
                ? "bg-[#2E7D32] hover:bg-[#256D3A] active:scale-[0.98]"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Saving..." : "Get Started"}
        </button>
      </div>
    </div>
  );
};

export default SetUsername;
