const Voucher = require("../models/Voucher");
const { createVoucherQR } = require("../services/voucherService");

const generateQR = async (req, res) => {
    try {

        const { voucherId, amount } = req.body;

        // Validate request
        if (!voucherId || !amount) {
            return res.status(400).json({
                success: false,
                message: "voucherId and amount are required"
            });
        }

        // Find voucher belonging to logged-in user
        const voucher = await Voucher.findOne({
            voucherId,
            owner: req.user._id
        });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: "Voucher not found"
            });
        }

        // Check voucher status
        if (voucher.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Voucher is not active"
            });
        }

        // Check balance
        if (voucher.remainingValue < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient voucher balance"
            });
        }

        // Generate QR
        const {qr,payload} = await createVoucherQR(voucher, amount);

        return res.status(200).json({
            success: true,
            qr,
            payload
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

module.exports = {
    generateQR
};