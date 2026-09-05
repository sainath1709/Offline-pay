const Transaction = require("../models/Transaction");

// ============================
// Transaction History
// ============================
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================
// Scan QR
// ============================
const scanQR = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findOne({
      transactionId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "Already Used",
      });
    }

    if (new Date() > transaction.expiresAt) {
      transaction.status = "EXPIRED";
      await transaction.save();

      return res.status(400).json({
        success: false,
        error: "QR Expired",
      });
    }

    transaction.status = "SCANNED";
    transaction.receiver = req.user._id;

    await transaction.save();

    return res.json({

    success: true,

    transactionId: transaction.transactionId,

    amount: transaction.amount,

    voucherId: transaction.voucherId,

    expiresAt: transaction.expiresAt,

    status: transaction.status

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
  getTransactions,
  scanQR,
};