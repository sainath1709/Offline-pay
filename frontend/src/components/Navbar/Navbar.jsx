import { FaBell, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  
  return (
    <div className="h-20 flex items-center justify-between px-8 border-b border-gray-800 bg-[#090B1A]">
      <div>
        <h2 className="text-2xl font-bold">
          Welcome Back 👋
        </h2>

        <p className="text-gray-400">
          Manage your offline payments
        </p>
      </div>

      <div className="flex items-center gap-6">
        <FaBell size={22} />

        <FaUserCircle size={34} />
      </div>
    </div>
  );
}