const crypto = require("crypto");

const Voucher = require("../models/Voucher");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const { generateQRCode } = require("./qrService");

// =========================
// Create Voucher
// =========================
const createVoucher = async (owner, amount) => {

    const wallet = await Wallet.findOne({ user: owner });

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    if (wallet.onlineBalance < amount) {
        throw new Error("Insufficient online balance");
    }

    const voucherId = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString("hex");
    const voucherSecret = crypto.randomBytes(32).toString("hex");

    const signature = crypto
        .createHmac("sha256", process.env.JWT_SECRET)
        .update(voucherId + owner + amount + nonce)
        .digest("hex");

    const voucher = await Voucher.create({
        voucherId,
        owner,
        totalValue: amount,
        remainingValue: amount,
        nonce,
        signature,
        voucherSecret
    });

    // Update wallet
    wallet.onlineBalance -= amount;
    wallet.offlineBalance += amount;
    wallet.offlineCounter += 1;
    wallet.lastSyncedAt = new Date();

    await wallet.save();

    return voucher;
};

// =========================
// Create QR
// =========================
const createVoucherQR = async (voucher, amount) => {

    if (voucher.remainingValue < amount) {
        throw new Error("Insufficient Balance");
    }

    voucher.remainingValue -= amount;

    await voucher.save();

    const transactionId = crypto.randomUUID();

    const qrNonce = crypto.randomBytes(16).toString("hex");

    const transaction = await Transaction.create({

    transactionId,

    voucherId: voucher.voucherId,

    sender: voucher.owner,

    amount,

    qrNonce,

    status: "PENDING",

    expiresAt: new Date(Date.now() + 60 * 1000)

});

    const payload = {
        transactionId,
        voucherId: voucher.voucherId,
        amount,
        qrNonce,
        timestamp: Date.now(),
        expiresAt: transaction.expiresAt,
        signature: voucher.signature
    };
console.log("Payload being encoded:");
console.log(JSON.stringify(payload));
console.log("Payload:", JSON.stringify(payload, null, 2));
    const qr = await generateQRCode(payload);

    return {qr,payload};

};

module.exports = {

    createVoucher,

    createVoucherQR

};