const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getTransactions,
    scanQR
} = require("../controllers/transactionController");

const { spendVoucher } = require("../controllers/paymentController");
const { syncTransactions } = require("../controllers/syncController");

router.post("/scan", protect, scanQR);
router.post("/accept", protect, spendVoucher);
router.post("/sync", protect, syncTransactions);
router.get("/", protect, getTransactions);
module.exports = router;