const mongoose = require("mongoose");

const offlineTokenSchema = new mongoose.Schema(
    {
        tokenId: {
            type: String,
            required: true,
            unique: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        value: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["ACTIVE", "PENDING", "SPENT", "REDEEMED"],
            default: "ACTIVE"
        },

        issuedAt: {
            type: Date,
            default: Date.now
        },

        signature: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const OfflineToken = mongoose.model(
    "OfflineToken",
    offlineTokenSchema
);

module.exports = OfflineToken;