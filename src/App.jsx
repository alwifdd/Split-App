import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// PAGES IMPORTS
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetUsername from "./pages/SetUsername";
import Home from "./pages/Home";
import GroupList from "./pages/GroupList";
import GroupDetail from "./pages/GroupDetail";
import YourOwe from "./pages/YourOwe";
import BillDetail from "./pages/BillDetail";

// SPLIT BILL FLOW
import SplitBill from "./pages/SplitBill";
import SplitSuccess from "./pages/SplitSuccess";

import logoIcon from "./assets/logo-icon.png";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">
          <img
            src={logoIcon}
            alt="Loading..."
            className="object-contain"
            style={{ width: "280px", height: "280px" }}
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
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/set-username" element={<SetUsername />} />

            <Route path="/history" element={<History />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/home" element={<Home />} />
            <Route path="/groups" element={<GroupList />} />
            <Route path="/group-detail/:id" element={<GroupDetail />} />

            <Route path="/your-owe" element={<YourOwe />} />
            <Route path="/bill-detail" element={<BillDetail />} />

            <Route path="/split-bill" element={<SplitBill />} />
            <Route path="/split-success" element={<SplitSuccess />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
