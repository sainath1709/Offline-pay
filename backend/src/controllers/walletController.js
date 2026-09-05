const Wallet = require("../models/Wallet");

const getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        return res.status(200).json({
            success: true,
            wallet: {
                onlineBalance: wallet.onlineBalance,
                offlineBalance: wallet.offlineBalance,
                offlineCounter: wallet.offlineCounter,
                lastSyncedAt: wallet.lastSyncedAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ============================
// Top Up Online Balance
// ============================
const topupWallet = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid top-up amount"
            });
        }

        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        wallet.onlineBalance += Number(amount);
        await wallet.save();

        return res.status(200).json({
            success: true,
            message: `₹${amount} added to your wallet!`,
            wallet: {
                onlineBalance: wallet.onlineBalance,
                offlineBalance: wallet.offlineBalance,
                offlineCounter: wallet.offlineCounter,
                lastSyncedAt: wallet.lastSyncedAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getWallet,
    topupWallet
};