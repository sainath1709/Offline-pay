const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        onlineBalance: {
            type: Number,
            default: 10000,
            min: 0
        },

        offlineBalance: {
            type: Number,
            default: 0,
            min: 0
        },

        offlineCounter: {
            type: Number,
            default: 0
        },

        lastSyncedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;