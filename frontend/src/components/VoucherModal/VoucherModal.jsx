import { useState } from "react";
import API from "../../services/api";

export default function VoucherModal({
    
  open,
  onClose,
  onSuccess,
}) {
    console.log("Modal open:", open);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const createVoucher = async () => {
    try {
      setLoading(true);

      await API.post("/voucher", {
        amount: Number(amount),
      });

      onSuccess();
      onClose();
      setAmount("");

    } catch (err) {
      alert(err.response?.data?.error || "Unable to create voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-[#161B33] w-[420px] rounded-3xl p-8">

        <h2 className="text-3xl font-bold mb-6">
          Create Offline Voucher
        </h2>

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#242B45] rounded-xl p-4 outline-none"
        />

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="bg-gray-600 px-6 py-3 rounded-xl"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={createVoucher}
            className="bg-violet-600 px-6 py-3 rounded-xl"
          >
            {loading ? "Creating..." : "Create"}
          </button>

        </div>

      </div>

    </div>
  );
}