const express = require("express");
const cors = require("cors");
const voucherRoutes =require("./routes/voucherRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const qrRoutes = require("./routes/qrRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "OfflinePay API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/voucher",voucherRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
module.exports = app;