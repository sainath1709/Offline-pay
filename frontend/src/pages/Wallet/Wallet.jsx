import { useEffect, useState } from "react";
import API from "../../services/api";
import VoucherModal from "../../components/VoucherModal/VoucherModal";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const [pendingSyncBalance, setPendingSyncBalance] = useState(0);

  useEffect(() => {
    fetchWallet();
    calculatePendingSync();
  }, []);

  const calculatePendingSync = () => {
    const queueStr = localStorage.getItem("offlinePendingTransactions");
    if (queueStr) {
      const queue = JSON.parse(queueStr);
      const total = queue.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      setPendingSyncBalance(total);
    } else {
      setPendingSyncBalance(0);
    }
  };

  const fetchWallet = async () => {
    // 1. Try to load from cache first
    const cached = localStorage.getItem("offlineWallet");
    if (cached) {
      setWallet(JSON.parse(cached));
    }

    // 2. Fetch from network
    try {
      const res = await API.get("/wallet");
      setWallet(res.data.wallet);
      localStorage.setItem("offlineWallet", JSON.stringify(res.data.wallet));
    } catch (err) {
      console.log("Offline mode: showing cached wallet", err.message);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      return alert("Enter a valid amount");
    }
    try {
      setTopupLoading(true);
      const res = await API.post("/wallet/topup", {
        amount: Number(topupAmount),
      });
      alert(res.data.message);
      setTopupAmount("");
      setShowTopup(false);
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || "Top-up failed");
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">

      <h1 className="text-4xl font-bold mb-8">My Wallet</h1>

      {/* Balance Cards */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Online Balance */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-8 shadow-xl">
          <p className="text-white/70 uppercase tracking-wider">
            Online Balance
          </p>
          <h1 className="text-5xl font-bold mt-5">
            ₹{wallet?.onlineBalance ?? 0}
          </h1>
          <p className="mt-8 text-white/70">
            Available to spend
          </p>
        </div>

        {/* Offline Balance (Vouchers) */}
        <div className="rounded-3xl bg-[#161B33] p-8 shadow-xl border border-gray-700">
          <p className="text-gray-400 uppercase tracking-wider">
            Voucher Balance
          </p>
          <h1 className="text-5xl font-bold mt-5 text-green-400">
            ₹{wallet?.offlineBalance ?? 0}
          </h1>
          <p className="mt-8 text-gray-400">
            Stored for offline payments
          </p>
        </div>

        {/* Pending Sync (Received Offline) */}
        <div className="rounded-3xl bg-[#2b2016] p-8 shadow-xl border border-orange-500/30">
          <p className="text-orange-300 uppercase tracking-wider">
            Pending Sync
          </p>
          <h1 className="text-5xl font-bold mt-5 text-orange-400">
            ₹{pendingSyncBalance}
          </h1>
          <p className="mt-8 text-orange-300/80">
            Incoming offline payments
          </p>
        </div>

      </div>

      {/* Wallet Information */}
      <div className="bg-[#161B33] rounded-3xl mt-10 p-8">
        <h2 className="text-2xl font-bold mb-6">Wallet Information</h2>
        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <p className="text-gray-400">Voucher Counter</p>
            <h3 className="text-3xl font-bold mt-2">
              {wallet?.offlineCounter ?? 0}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">Last Synced</p>
            <h3 className="text-xl font-semibold mt-2">
              {wallet?.lastSyncedAt
                ? new Date(wallet.lastSyncedAt).toLocaleString()
                : "Never"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">Status</p>
            <h3 className="text-green-400 text-xl font-semibold mt-2">
              ● Connected
            </h3>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap gap-4">

        <button
          onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-700 transition px-8 py-4 rounded-xl font-semibold"
        >
          Convert to Offline Voucher
        </button>

        <button
          onClick={() => setShowTopup(!showTopup)}
          className="bg-green-600 hover:bg-green-700 transition px-8 py-4 rounded-xl font-semibold"
        >
          + Add Money
        </button>

        <button
          onClick={fetchWallet}
          className="bg-gray-700 hover:bg-gray-600 transition px-8 py-4 rounded-xl font-semibold"
        >
          Refresh
        </button>

      </div>

      {/* Top-up Panel */}
      {showTopup && (
        <div className="mt-6 bg-[#161B33] rounded-2xl p-6 max-w-sm border border-green-500/30">
          <h3 className="text-lg font-bold mb-4 text-green-400">
            💰 Add Money to Wallet
          </h3>
          <div className="flex gap-3">
            {/* Quick amounts */}
            {[500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopupAmount(String(amt))}
                className="bg-[#242B45] hover:bg-violet-700 transition px-4 py-2 rounded-xl text-sm font-semibold"
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Or enter custom amount"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            className="w-full mt-4 p-3 rounded-xl bg-[#242B45] outline-none border border-gray-600 focus:border-green-500"
          />
          <button
            onClick={handleTopup}
            disabled={topupLoading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 transition py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {topupLoading ? "Adding..." : "Add Money"}
          </button>
        </div>
      )}

      {/* Voucher Modal */}
      <VoucherModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchWallet}
      />

    </div>
  );
};

export default Wallet;