import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home"; // Import Home
import SetUsername from "./pages/SetUsername";

// PERHATIKAN BARIS INI: Pastikan nama filenya "logo-icon.png"
// dan file tersebut BENAR-BENAR ADA di dalam folder "src/assets/"
import logoIcon from "./assets/logo-icon.png";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // === TAMPILAN SPLASH SCREEN ===
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="animate-pulse">
          <img
            src={logoIcon}
            alt="Loading..."
            // UBAH DISINI: Kita kunci ukurannya jadi 390px
            style={{ width: "280px", height: "280px" }}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // === TAMPILAN APLIKASI UTAMA ===
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="w-full max-w-[400px] bg-white h-screen shadow-2xl relative overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} /> {/* <-- TAMBAH INI */}
            <Route path="/set-username" element={<SetUsername />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
