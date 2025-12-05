import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";

const SetUsername = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Style input konsisten
  const inputStyle =
    "w-full bg-gray-100 border-transparent focus:bg-white border focus:border-[#1E4720] px-4 py-4 rounded-lg outline-none transition-colors text-gray-700 placeholder-gray-400 font-medium";

  const handleSubmit = () => {
    if (username.length > 3) {
      // Nanti disini logika simpan ke database
      navigate("/home");
    } else {
      alert("Username minimal 4 karakter ya!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white justify-center px-8">
      {/* Logo Kecil di Atas */}
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-[#1E4720] rounded-[24px] rotate-45 flex items-center justify-center shadow-lg">
          <img
            src={logoIcon}
            alt="Logo"
            style={{ width: "60px", height: "60px" }}
            className="-rotate-45 object-contain"
          />
        </div>
      </div>

      {/* Teks Sambutan */}
      <div className="text-center mb-10">
        <h1 className="font-bold text-gray-900 text-2xl mb-2">
          One Last Step! 🚀
        </h1>
        <p className="text-gray-500 text-sm">
          Create a unique username so your friends can easily find and split
          bills with you.
        </p>
      </div>

      {/* Input Username */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#1E4720] ml-1 mb-2 block">
            CHOOSE USERNAME
          </label>
          <div className="relative">
            {/* Ikon @ mati di kiri */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              @
            </span>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
              } // Auto lowercase & hapus spasi
              placeholder="cool_guy"
              style={{ fontSize: "16px", paddingLeft: "35px" }} // Padding kiri biar gak nabrak @
              className={inputStyle}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 ml-1">
            *You can use letters, numbers, and underscores.
          </p>
        </div>

        {/* Tombol Lanjut */}
        <button
          onClick={handleSubmit}
          className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-md mt-6
                ${
                  username.length > 3
                    ? "bg-[#2E7D32] hover:bg-[#256D3A] active:scale-[0.98]"
                    : "bg-gray-300 cursor-not-allowed"
                }
            `}
          style={{ fontSize: "16px" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default SetUsername;
