import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

// Helper to create HMAC-SHA256 hash using Web Crypto API
const signPayload = async (message, secret) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  // Convert ArrayBuffer to Hex String
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const QRCodeModal = ({ open, voucher, onClose }) => {
  const [amount, setAmount] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (qrPayload && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (qrPayload && timeLeft === 0) {
      handleClose();
    }
    return () => clearInterval(timer);
  }, [qrPayload, timeLeft]);

  const handleClose = () => {
    setQrPayload(null);
    setAmount("");
    setTimeLeft(0);
    onClose();
  };

  if (!open || !voucher) return null;

  const generateQROffline = async () => {
    try {
      if (!amount || Number(amount) <= 0) {
        return alert("Enter a valid amount");
      }

      if (Number(amount) > voucher.remainingValue) {
        return alert("Amount exceeds voucher balance");
      }

      setLoading(true);

      // 1. Generate local transaction parameters
      const transactionId = crypto.randomUUID();
      const qrNonce = crypto.randomUUID().replace(/-/g, "").substring(0, 32);
      const timestamp = Date.now();
      const expiresAt = new Date(timestamp + 30 * 1000).toISOString();

      // 2. Prepare message for signing: voucherId + owner + amount + qrNonce
      const messageToSign = voucher.voucherId + voucher.owner + amount + qrNonce;

      // 3. Cryptographically sign the message locally using voucherSecret
      const signature = await signPayload(
        messageToSign,
        voucher.voucherSecret
      );

      // 4. Construct the QR payload
      const payload = {
        transactionId,
        voucherId: voucher.voucherId,
        amount: Number(amount),
        qrNonce,
        timestamp,
        expiresAt,
        signature,
      };

      setQrPayload(JSON.stringify(payload));
      setTimeLeft(30);

      // Deduct locally just for UI reflection (won't persist on refresh until sync)
      // voucher.remainingValue -= Number(amount); // REMOVED: As requested, do not deduct until accepted/synced.

      // Log it locally for the sender's history instantly
      const senderQueueStr = localStorage.getItem("offlineSentTransactions") || "[]";
      const senderQueue = JSON.parse(senderQueueStr);
      senderQueue.push({
        transactionId,
        voucherId: voucher.voucherId,
        amount: Number(amount),
        timestamp,
        status: "PENDING_SENT"
      });
      localStorage.setItem("offlineSentTransactions", JSON.stringify(senderQueue));

    } catch (err) {
      console.error(err);
      alert("Unable to generate QR offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#161B33] rounded-3xl p-8 w-[650px] max-w-[95vw]">
        <h2 className="text-3xl font-bold mb-6">
          Generate Payment QR (Offline)
        </h2>

        {!qrPayload ? (
          <>
            <p className="text-gray-400 mb-2">Voucher Balance</p>

            <h1 className="text-5xl font-bold text-green-400 mb-8">
              ₹{voucher.remainingValue}
            </h1>

            <input
              type="number"
              placeholder="Enter Payment Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#242B45] outline-none"
            />

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleClose}
                className="bg-gray-600 px-6 py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={generateQROffline}
                disabled={loading}
                className="bg-violet-600 px-6 py-3 rounded-xl"
              >
                {loading ? "Generating..." : "Generate QR"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <QRCode value={qrPayload} size={256} />
            </div>

            <p className="mt-5 text-lg">Amount : ₹{amount}</p>
            <p className="mt-2 text-yellow-400 font-semibold">
              ⏳ Expires in {timeLeft} seconds
            </p>
            <button
              onClick={handleClose}
              className="mt-8 bg-violet-600 px-8 py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;