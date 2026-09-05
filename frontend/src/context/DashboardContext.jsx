import { createContext, useContext, useEffect, useState } from "react";

import { getWallet } from "../services/walletService";
import { getVouchers } from "../services/voucherService";
import { getTransactions } from "../services/transactionService";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [walletRes, voucherRes, transactionRes] =
        await Promise.all([
          getWallet(),
          getVouchers(),
          getTransactions(),
        ]);

      setWallet(walletRes.data.wallet);
      setVouchers(voucherRes.data.vouchers);
      setTransactions(transactionRes.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        wallet,
        vouchers,
        transactions,
        loading,
        fetchDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);