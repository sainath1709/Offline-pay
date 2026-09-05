import "./ScanQR.css";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import API from "../../services/api";

const ScanQR = () => {
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState("");
  const [scanned, setScanned] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [useAnyCamera, setUseAnyCamera] = useState(false);

  const handleScan = async (result) => {
    if (!result || scanned) return;

    try {
      setScanned(true);
      const decodedText = result[0].rawValue;
      console.log("Decoded QR Payload:", decodedText);

      const payload = JSON.parse(decodedText);

      // 1. Basic Offline Structure Check
      if (!payload.transactionId || !payload.signature || !payload.amount) {
        throw new Error("Invalid or corrupted QR Code.");
      }

      // 2. Local Expiration Check
      if (new Date(payload.expiresAt).getTime() < Date.now()) {
        throw new Error("This payment QR has expired.");
      }

      // 3. (Phase 2 will add proper cryptographic verification here)

      // Set payment locally without API call
      setPayment({
        transactionId: payload.transactionId,
        voucherId: payload.voucherId,
        amount: payload.amount,
        status: "OFFLINE_SCANNED",
        expiresAt: payload.expiresAt,
        // Keep the full payload to forward later
        rawPayload: payload
      });
      
      setMessage("QR Verified Locally");
    } catch (err) {
      console.error(err);
      alert(err.message || "Invalid QR");
      setScanned(false);
    }
  };

  const handleCameraError = (err) => {
    console.error("Camera error:", err);
    if (!useAnyCamera) {
      setUseAnyCamera(true);
      setCameraError(null);
    } else {
      setCameraError(
        "Camera not accessible. Please allow camera permissions and refresh."
      );
    }
  };

  const acceptPayment = async () => {
    try {
      // Offline Store & Forward
      const queueStr = localStorage.getItem("offlinePendingTransactions") || "[]";
      const queue = JSON.parse(queueStr);

      // Prevent duplicate scan
      if (queue.some((tx) => tx.transactionId === payment.transactionId)) {
        alert("This transaction is already queued for sync.");
        window.location.reload();
        return;
      }

      // Add to queue
      queue.push({
        ...payment.rawPayload,
        scannedAt: new Date().toISOString(),
      });

      localStorage.setItem("offlinePendingTransactions", JSON.stringify(queue));
      
      alert("Payment accepted and stored offline! Will sync when internet is available.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to store payment offline.");
    }
  };

  return (
    <div className="scan-page">

      <h1 className="scan-title">Scan Payment QR</h1>

      {!payment && (
        <div className="scanner-container">

          {cameraError ? (
            <div className="camera-error">
              <p>📷 {cameraError}</p>
            </div>
          ) : (
            <>
              <div className="scanner-status">
                <span className="scanner-dot" />
                Scanning...
              </div>

              <Scanner
                onScan={handleScan}
                onError={handleCameraError}
                constraints={{
                  facingMode: useAnyCamera ? "user" : "environment",
                }}
                styles={{
                  container: { width: "100%" },
                }}
              />
            </>
          )}

        </div>
      )}

      {payment && (
        <div className="payment-card">
          <h2 className="payment-title">Payment Details</h2>

          <div className="payment-row">
            <span className="payment-label">Amount</span>
            <span className="payment-value">₹{payment.amount}</span>
          </div>

          <div className="payment-row">
            <span className="payment-label">Voucher ID</span>
            <span>{payment.voucherId?.slice(0, 12)}...</span>
          </div>

          <div className="payment-row">
            <span className="payment-label">Status</span>
            <span className="payment-value">{payment.status}</span>
          </div>

          <div className="payment-row">
            <span className="payment-label">Expires At</span>
            <span className="text-yellow-400">
              {new Date(payment.expiresAt).toLocaleTimeString()}
            </span>
          </div>

          {message && (
            <p className="success-msg">✅ {message}</p>
          )}

          <button className="accept-btn" onClick={acceptPayment}>
            Accept Payment
          </button>

          <button
            className="cancel-btn"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
        </div>
      )}

    </div>
  );
};

export default ScanQR;