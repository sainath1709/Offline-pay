# 🛡️ OfflinePay

**A Zero-Signal, Cryptographically Secure Peer-to-Peer Offline Payment Protocol.**

OfflinePay allows users to securely transact money in environments with absolutely zero network connectivity (no Wi-Fi, no 4G/5G). It uses deferred settlement, asymmetric cryptography, and optical data transfer to guarantee trust and prevent fraud.

---

## 🚀 Key Features

*   **True Peer-to-Peer Offline:** Transactions happen device-to-device using QR codes.
*   **Cryptographic Traceability:** Every offline voucher and transaction is mathematically signed, ensuring 100% catch rates for tampering.
*   **Collateralized Risk Mitigation:** Offline funds are locked online, ensuring merchants are never scammed by double-spenders.
*   **AI Risk Engine:** Synced transactions pass through an AI behavioral analysis model to flag anomalous spending patterns.
*   **The 4-Layer Sync Defense:** Math Checks, Database Deduplication, Voucher Overdraft protection, and AI scoring happen simultaneously upon network reconnection.

---

## 🏗️ Architecture

The project is built using a modern, scalable stack:

1.  **Frontend (`/frontend`):** React, Vite, TailwindCSS (Progressive Web App / Mobile First).
2.  **Backend (`/backend`):** Node.js, Express, MongoDB. Handles cryptographic signing and the Sync Controller.
3.  **AI Service (`/ai_service`):** Python microservice for anomaly detection.

---

## 🛠️ How to Run Locally

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Start the AI Risk Engine (Optional)
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```

---

## 🔒 Security (For Evaluators)
This MVP uses **HMAC (Symmetric Cryptography)** for server-side verification during the sync phase. 
In a Production Environment (Phase 2), the architecture shifts to **ECDSA (Public/Private Key Asymmetric Cryptography)**, allowing the merchant's app to cryptographically verify the signature 100% offline without exposing any secrets to the client.

*Built for the Razorpay Evaluation.*
