
const { createVoucher, createVoucherQR } = require("../services/voucherService");

const Wallet = require("../models/Wallet");
const mintVoucher = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { amount } = req.body;

    if (!amount || amount < 100) {
    return res.status(400).json({
        success: false,
        error: "Minimum voucher amount is ₹100",
    });
}
const wallet = await Wallet.findOne({
    user: req.user._id
});

if (!wallet) {
    return res.status(404).json({
        success: false,
        error: "Wallet not found"
    });
}
if (wallet.onlineBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient wallet balance",
      });
    }
    // NOTE: wallet deduction happens inside createVoucher() service — do NOT deduct here
    console.log("Before createVoucher");


    const voucher = await createVoucher(
      req.user._id,
      amount
    );

    console.log("Voucher Created:", voucher);

    return res.json({
      success: true,
      voucher,
    });

  } catch (err) {

    console.log("=========== ERROR ===========");
    console.log(err);
    console.log("=============================");

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const Voucher = require("../models/Voucher");

const getVouchers = async (req, res) => {
    try {

        const vouchers = await Voucher.find({
            owner: req.user._id
        });

        return res.status(200).json({
            success: true,
            count: vouchers.length,
            vouchers
        });

    } catch (err) {
    console.log("CREATE VOUCHER ERROR");
    console.log(err);

    return res.status(500).json({
        success: false,
        error: err.message
    });
}
};
const generateVoucherQR = async (req, res) => {
  try {
    console.log("QR Controller Reached");
    const { voucherId } = req.params;
    const { amount } = req.body;

    // Find voucher
    const voucher = await Voucher.findOne({
      _id: voucherId,
      owner: req.user._id,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: "Voucher not found",
      });
    }

    const result = await createVoucherQR(
      voucher,
      Number(amount)
    );

    return res.json({
      success: true,
      qr: result.qr,
      payload: result.payload,
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
module.exports = {
    mintVoucher,
    getVouchers,
    generateVoucherQR
};