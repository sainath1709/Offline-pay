const Voucher = require("../models/Voucher");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

const spendVoucher = async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: "transactionId is required"
            });
        }

        const transaction = await Transaction.findOne({ transactionId });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Transaction already completed"
            });
        }

        const voucher = await Voucher.findOne({
            voucherId: transaction.voucherId
        });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: "Voucher not found"
            });
        }

        // Mark transaction complete
        transaction.status = "COMPLETED";
        transaction.receiver = req.user._id;
        transaction.completedAt = new Date();
        await transaction.save();

        // Mark voucher spent if empty
        if (voucher.remainingValue === 0) {
            voucher.status = "SPENT";
            await voucher.save();
        }

        // ✅ Credit receiver's online wallet
        const receiverWallet = await Wallet.findOne({ user: req.user._id });
        if (receiverWallet) {
            receiverWallet.onlineBalance += transaction.amount;
            receiverWallet.lastSyncedAt = new Date();
            await receiverWallet.save();
        }

        // ✅ Update sender's wallet sync time
        const senderWallet = await Wallet.findOne({ user: transaction.sender });
        if (senderWallet) {
            senderWallet.lastSyncedAt = new Date();
            await senderWallet.save();
        }

        return res.json({
            success: true,
            message: `Payment of ₹${transaction.amount} successful!`,
            transaction
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

module.exports = { spendVoucher };