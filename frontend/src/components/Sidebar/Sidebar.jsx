import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaWallet,
  FaTicketAlt,
  FaExchangeAlt,
  FaChartBar,
  FaCamera,
  FaBrain,
  FaRobot,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
  { name: "Wallet", path: "/wallet", icon: <FaWallet /> },
  { name: "Voucher", path: "/voucher", icon: <FaTicketAlt /> },
  { name: "Transactions", path: "/transactions", icon: <FaExchangeAlt /> },
  { name: "Analytics", path: "/analytics", icon: <FaChartBar /> },
  { name: "Scan QR", path: "/scan", icon: <FaCamera /> },
  { name: "AI Risk Engine", path: "/ai-dashboard", icon: <FaBrain /> },
  { name: "AI Assistant", path: "/ai-assistant", icon: <FaRobot /> },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#111827] min-h-screen border-r border-gray-800 p-6">
      <h1 className="text-3xl font-bold text-violet-400 mb-12">
        OfflinePay
      </h1>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}