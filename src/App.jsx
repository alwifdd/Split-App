import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SetUsername from "./pages/SetUsername";
import GroupList from "./pages/GroupList";
import GroupDetail from "./pages/GroupDetail";
import YourOwe from "./pages/YourOwe"; // <-- IMPORT INI
import BillDetail from "./pages/BillDetail";

// 🔥 TAMBAHAN ROUTE BARU
import SplitBill from "./pages/SplitBill";
import SplitSuccess from "./pages/SplitSuccess";
<Route path="/your-owe" element={<YourOwe />} />;
import logoIcon from "./assets/logo-icon.png";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
            style={{ width: "280px", height: "280px" }}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="w-full max-w-[400px] bg-white h-screen shadow-2xl relative overflow-hidden flex flex-col">
          <Routes>
            {/* AUTH & ONBOARDING */}
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/set-username" element={<SetUsername />} />

            {/* HOME & GROUP */}
            <Route path="/home" element={<Home />} />
            <Route path="/groups" element={<GroupList />} />
            <Route path="/group-detail/:id" element={<GroupDetail />} />

            {/* 💸 SPLIT BILL FLOW */}
            <Route path="/split-bill" element={<SplitBill />} />
            <Route path="/split-success" element={<SplitSuccess />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
