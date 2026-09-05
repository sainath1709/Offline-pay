const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    transactionId: {
        type: String,
        unique: true,
        required: true
    },

    voucherId: {
        type: String,
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "SCANNED",
            "COMPLETED",
            "SUCCESS",
            "FAILED",
            "EXPIRED",
            "REVIEW_NEEDED",
            "REJECTED"
        ],
        default: "PENDING"
    },

    qrNonce: {
        type: String,
        required: true,
        unique: true
    },

    expiresAt: {
        type: Date,
        required: true
    },
    scannedAt: {
    type: Date,
    default: null
    },
    completedAt: {
    type: Date,
    default: null
    },
    riskScore: {
        type: Number,
        default: 0
    },
    anomalyFlags: [{
        type: String
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);