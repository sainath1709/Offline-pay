const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({

    voucherId: {
        type: String,
        unique: true,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    totalValue: {
        type: Number,
        required: true
    },

    remainingValue: {
        type: Number,
        required: true
    },

    nonce: {
        type: String,
        required: true
    },

    signature: {
        type: String,
        required: true
    },

    voucherSecret: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["ACTIVE", "LOCKED", "SPENT"],
        default: "ACTIVE"
    }

}, { timestamps: true });

module.exports = mongoose.model("Voucher", voucherSchema);