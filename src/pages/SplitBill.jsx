import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack, IoTrashOutline } from "react-icons/io5";
import { FiPlus, FiMinus } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";

const SplitBill = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { groupName, groupIcon, members, groupId } = location.state || {
    groupName: "Group",
    groupIcon: "🧾",
    members: [],
  };

  const authUser = auth.currentUser;
  const currentUser = {
    uid: authUser ? authUser.uid : "me",
    id: authUser ? authUser.uid : "me",
    name: authUser?.displayName || "You",
    username: "me",
    avatar: authUser?.photoURL || "default",
  };

  const formattedMembers = members
    .filter((m) => (m.uid || m.id) !== currentUser.uid)
    .map((m) => ({
      uid: m.uid || m.id,
      id: m.uid || m.id,
      name: m.name || m.displayName || m.username || "Unknown",
      username: m.username || "",
      avatar: m.avatar || m.photoURL || "default",
    }));

  const allMembers = [currentUser, ...formattedMembers];

  const [tax, setTax] = useState("");
  const [service, setService] = useState("");
  const [memberOrders, setMemberOrders] = useState(
    allMembers.map((m) => ({
      memberId: m.uid,
      memberName: m.name,
      items: [{ id: Date.now() + Math.random(), name: "", price: "", qty: "" }],
    })),
  );

  // LOGIK TOMBOL: Hanya aktif jika SEMUA terisi dan SEMUA > 0
  const isFormValid = memberOrders.every((member) =>
    member.items.every(
      (item) =>
        item.name.trim() !== "" &&
        item.price !== "" &&
        parseFloat(item.price) > 0 &&
        item.qty !== "" &&
        parseFloat(item.qty) > 0,
    ),
  );

  const handleAddItem = (memberIndex) => {
    const newOrders = [...memberOrders];
    newOrders[memberIndex].items.push({
      id: Date.now() + Math.random(),
      name: "",
      price: "",
      qty: "",
    });
    setMemberOrders(newOrders);
  };

  const handleInputChange = (memberIndex, itemIndex, field, value) => {
    const newOrders = [...memberOrders];
    newOrders[memberIndex].items[itemIndex][field] = value;
    setMemberOrders(newOrders);
  };

  const handleQtyChange = (memberIndex, itemIndex, delta) => {
    const newOrders = [...memberOrders];
    const currentQty =
      parseInt(newOrders[memberIndex].items[itemIndex].qty) || 0;
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      newOrders[memberIndex].items[itemIndex].qty = newQty;
      setMemberOrders(newOrders);
    }
  };

  const handleDeleteItem = (memberIndex, itemIndex) => {
    const newOrders = [...memberOrders];
    if (newOrders[memberIndex].items.length > 1) {
      newOrders[memberIndex].items.splice(itemIndex, 1);
    } else {
      newOrders[memberIndex].items[itemIndex] = {
        id: Date.now(),
        name: "",
        price: "",
        qty: "",
      };
    }
    setMemberOrders(newOrders);
  };

  const handleSplitNow = () => {
    if (!isFormValid) return;
    navigate("/split-success", {
      state: {
        groupId,
        groupName,
        groupIcon,
        members: allMembers,
        memberOrders,
        tax: parseFloat(tax) || 0,
        service: parseFloat(service) || 0,
      },
    });
  };

  const UserAvatar = ({ url, size = "w-14 h-14", iconSize = 20 }) => {
    if (url && url !== "default" && url.startsWith("http")) {
      return (
        <img
          src={url}
          alt="Ava"
          className={`${size} rounded-full object-cover bg-gray-200 border-2 border-white shadow-sm`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-400`}
      >
        <FaUser size={iconSize} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 active:opacity-60"
        >
          <IoChevronBack size={24} />
          <span className="font-semibold ml-1 text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 px-6">
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-20 h-20 rounded-full bg-[#C1E2CA] flex items-center justify-center text-4xl mb-4 shadow-sm">
            {groupIcon}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-6">{groupName}</h1>
          <div className="w-full">
            <h3 className="text-left font-bold text-gray-800 mb-3 ml-1">
              Members
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {allMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center min-w-[60px]"
                >
                  <UserAvatar url={m.avatar} size="w-14 h-14" />
                  <span className="text-xs font-medium text-gray-600 mt-2 text-center truncate w-full">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {memberOrders.map((order, memberIndex) => (
            <div
              key={memberIndex}
              className="border-b border-gray-100 pb-8 last:border-0"
            >
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">
                  Who orders
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-bold text-gray-800 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      url={allMembers[memberIndex].avatar}
                      size="w-6 h-6"
                      iconSize={10}
                    />
                    <span>{order.memberName}</span>
                  </div>
                  <span className="text-xs text-gray-400">▼</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {order.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <div className="flex gap-2 items-start w-full">
                        {/* ITEM NAME */}
                        <div className="flex-[2]">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) =>
                              handleInputChange(
                                memberIndex,
                                itemIndex,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#2E7D32] transition-all"
                          />
                        </div>

                        {/* PRICE */}
                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) =>
                              handleInputChange(
                                memberIndex,
                                itemIndex,
                                "price",
                                e.target.value,
                              )
                            }
                            className={`w-full bg-white border ${parseFloat(item.price) < 0 ? "border-red-500" : "border-gray-200"} rounded-xl px-3 py-3 text-sm text-right focus:outline-none focus:border-[#2E7D32] transition-all`}
                          />
                          {/* Hanya muncul jika user input minus */}
                          {parseFloat(item.price) < 0 && (
                            <p className="text-[9px] text-red-500 font-bold mt-1 text-right">
                              ! NO MINUS
                            </p>
                          )}
                        </div>

                        {/* QTY */}
                        <div className="w-24">
                          {/* Tampilan input manual jika kosong atau sedang diedit */}
                          {item.qty === "" || parseFloat(item.qty) <= 0 ? (
                            <>
                              <input
                                type="number"
                                placeholder="Qty"
                                value={item.qty}
                                onChange={(e) =>
                                  handleInputChange(
                                    memberIndex,
                                    itemIndex,
                                    "qty",
                                    e.target.value,
                                  )
                                }
                                className={`w-full bg-white border ${parseFloat(item.qty) < 0 ? "border-red-500" : "border-gray-200"} rounded-xl px-1 py-3 text-sm text-center focus:outline-none focus:border-[#2E7D32] transition-all`}
                              />
                              {parseFloat(item.qty) < 0 && (
                                <p className="text-[9px] text-red-500 font-bold mt-1 text-center">
                                  ! NO MINUS
                                </p>
                              )}
                            </>
                          ) : (
                            /* Tampilan Stepper jika sudah ada nilai > 0 */
                            <div className="flex items-center justify-between bg-white border border-[#2E7D32] rounded-xl h-[46px] px-1">
                              <button
                                onClick={() =>
                                  handleQtyChange(memberIndex, itemIndex, -1)
                                }
                                className="w-6 h-full flex items-center justify-center text-[#2E7D32]"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="text-sm font-bold text-[#1E4720]">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  handleQtyChange(memberIndex, itemIndex, 1)
                                }
                                className="w-6 h-full flex items-center justify-center text-[#2E7D32]"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={() => handleAddItem(memberIndex)}
                className="w-full mt-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: "#C1E2CA",
                  border: "1px solid #375E3A",
                  color: "#375E3A",
                }}
              >
                <FiPlus className="text-lg" /> Add menu
              </button>
            </div>
          ))}
        </div>

        {/* TAX & SERVICE */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">
            Tax & Service Charges
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xs font-bold">
                  %
                </span>
                <input
                  type="number"
                  placeholder="Tax (10)"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:bg-white focus:border-[#2E7D32] outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xs font-bold">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="Service (2000)"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:bg-white focus:border-[#2E7D32] outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[400px] bg-white p-6 border-t border-gray-100 z-50">
        <button
          onClick={handleSplitNow}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${isFormValid ? "bg-[#2E7D32] hover:bg-[#256D3A]" : "bg-gray-300 cursor-not-allowed"}`}
        >
          Split Now
        </button>
      </div>
    </div>
  );
};

export default SplitBill;
