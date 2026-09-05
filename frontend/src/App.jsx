import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Dashboard from "./pages/Dashboard/Dashboard";
import Wallet from "./pages/Wallet/Wallet";
import Voucher from "./pages/Voucher/Voucher";

import Transactions from "./pages/Transactions/Transactions";
import Analytics from "./pages/Analytics/Analytics";
import AIDashboard from "./pages/AIDashboard/AIDashboard";
import AIAssistant from "./pages/AIAssistant/AIAssistant";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ScanQR from "./pages/ScanQR/ScanQR";
function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/voucher" element={<Voucher />} />
        <Route path="/scan" element={<ScanQR />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-dashboard" element={<AIDashboard />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Route>
    </Routes>
  );
}

export default App;