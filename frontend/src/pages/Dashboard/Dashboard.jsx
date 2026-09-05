import { useEffect, useState } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";

import WalletCard from "../../components/WalletCard/WalletCard";
import VoucherCard from "../../components/VoucherCard/VoucherCard";
import TransactionCard from "../../components/TransactionCard/TransactionCard";
import SpendingChart from "../../components/Charts/SpendingChart";

const Dashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    const walletRes = await API.get("/wallet");
    console.log("Wallet:", walletRes.data);

    const voucherRes = await API.get("/voucher");
    console.log("Voucher:", voucherRes.data);

    const transactionRes = await API.get("/transactions");
    console.log("Transaction:", transactionRes.data);

    setWallet(walletRes.data.wallet);
    setVouchers(voucherRes.data.vouchers);
    setTransactions(transactionRes.data.transactions);
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="min-h-screen bg-[#0B1020] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <WalletCard wallet={wallet} />
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <VoucherCard vouchers={vouchers} />
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <TransactionCard transactions={transactions} />
  </motion.div>

</div>

      <div className="mt-10">
        <SpendingChart transactions={transactions} />
      </div>
    </div>
  );
};

export default Dashboard;