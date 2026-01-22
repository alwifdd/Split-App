import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { FaUser, FaCamera, FaRegCreditCard, FaWallet } from "react-icons/fa";
import { FiLogOut, FiEdit3 } from "react-icons/fi";

// FIREBASE
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State Data User (dari DB)
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk Mode Edit
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // State Form (Penampung data sementara saat ngedit)
  const [editForm, setEditForm] = useState({
    username: "",
    bankAccount: "",
    eWallet: "",
    avatarPreview: null, // Untuk nampilin foto lokal sebelum upload
    imageFile: null, // File mentah untuk diupload ke Storage (nanti)
  });

  // Helper Avatar
  const UserAvatar = ({ url, size, iconSize = 20 }) => {
    // Prioritaskan preview lokal jika ada, kalau gak ada pake URL dari DB
    const displayUrl = editForm.avatarPreview || url;

    if (
      displayUrl &&
      displayUrl !== "default" &&
      displayUrl.startsWith("blob:" || "http")
    ) {
      return (
        <img
          src={displayUrl}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border-4 border-white shadow-md`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-gray-400`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  // 1. FETCH DATA USER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({ uid: user.uid, ...data });
            // Siapkan data awal untuk form edit
            setEditForm({
              username: data.username || user.displayName || "",
              bankAccount: data.bankAccount || "",
              eWallet: data.eWallet || "",
              avatarPreview: null,
              imageFile: null,
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. HANDLER GANTI FOTO (LOCAL PREVIEW)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Buat URL lokal untuk preview biar cepet
      const previewUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, avatarPreview: previewUrl, imageFile: file });
    }
  };

  // 3. HANDLER INPUT TEXT
  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  // 4. HANDLER SAVE PROFILE
  const handleSave = async () => {
    if (!userData) return;
    setSaving(true);
    try {
      // TODO: Di sini nanti tempat logic upload gambar ke Firebase Storage.
      // Karena belum ada setup Storage, kita skip dulu upload filenya.
      // Kita anggap foto berhasil diupload dan dapet URL baru.
      // const newPhotoURL = await uploadFile(editForm.imageFile) || userData.photoURL;

      // Update data teks ke Firestore
      const userDocRef = doc(db, "users", userData.uid);
      await updateDoc(userDocRef, {
        username: editForm.username,
        bankAccount: editForm.bankAccount,
        eWallet: editForm.eWallet,
        // photoURL: newPhotoURL // Nanti di uncomment kalau sudah ada storage
      });

      // Refresh data lokal
      setUserData({
        ...userData,
        username: editForm.username,
        bankAccount: editForm.bankAccount,
        eWallet: editForm.eWallet,
        // photoURL: newPhotoURL
      });

      setIsEditing(false); // Keluar mode edit
      setEditForm({ ...editForm, avatarPreview: null, imageFile: null }); // Reset preview
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // 5. HANDLER LOGOUT
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      navigate("/login");
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">
      <div className="w-full max-w-[400px] bg-white h-full relative flex flex-col">
        {/* HEADER AREA WITH BACKGROUND */}
        <div className="relative shrink-0">
          <div className="h-32 bg-[#C1E2CA] rounded-b-[40px]"></div>
          <div className="absolute left-0 right-0 -bottom-12 flex flex-col items-center">
            {/* AVATAR SECTION */}
            <div className="relative">
              <UserAvatar
                url={userData?.photoURL || userData?.avatar}
                size="w-24 h-24"
                iconSize={40}
              />

              {/* Tombol Kamera (Hanya muncul pas Edit) */}
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#1E4720] rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer active:scale-95"
                  >
                    <FaCamera size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-6 pt-16 pb-24 flex flex-col justify-between">
          {/* FORM / INFO SECTION */}
          <div className="space-y-6">
            {/* Username */}
            <div className="text-center mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="text-center font-bold text-xl text-gray-900 border-b border-gray-300 focus:border-green-600 outline-none pb-1 w-2/3 mx-auto"
                  placeholder="Username"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">
                  {userData?.username || "No Username"}
                </h1>
              )}
              <p className="text-sm text-gray-400">{userData?.email}</p>
            </div>

            {/* Payment Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm space-y-1">
              {/* Bank Account */}
              <div className="flex items-center p-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-4 shrink-0">
                  <FaRegCreditCard />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Bank Account / No. Rek
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.bankAccount}
                      onChange={(e) =>
                        handleInputChange("bankAccount", e.target.value)
                      }
                      className="font-medium text-sm text-gray-800 border-b border-gray-200 w-full focus:border-blue-500 outline-none py-0.5"
                      placeholder="BCA 12345678"
                    />
                  ) : (
                    <p className="font-medium text-sm text-gray-800">
                      {userData?.bankAccount || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-50 mx-3"></div>

              {/* E-Wallet */}
              <div className="flex items-center p-3">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4 shrink-0">
                  <FaWallet />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">E-Wallet</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.eWallet}
                      onChange={(e) =>
                        handleInputChange("eWallet", e.target.value)
                      }
                      className="font-medium text-sm text-gray-800 border-b border-gray-200 w-full focus:border-green-500 outline-none py-0.5"
                      placeholder="Gopay 0812..."
                    />
                  ) : (
                    <p className="font-medium text-sm text-gray-800">
                      {userData?.eWallet || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 mt-6">
            {isEditing ? (
              // MODE EDIT: Tombol Save & Cancel
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ ...editForm, avatarPreview: null }); // Reset preview
                  }}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-[#1E4720] hover:bg-[#163418] active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              // MODE VIEW: Tombol Edit & Logout
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 rounded-xl font-bold text-white bg-[#1E4720] shadow-sm hover:bg-[#163418] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FiEdit3 /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FiLogOut /> Log Out
                </button>
              </>
            )}
          </div>
        </div>

        <BottomNav activeTab="profile" />
      </div>
    </div>
  );
};

export default Profile;
