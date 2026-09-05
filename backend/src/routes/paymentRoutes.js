const express = require("express");

const router = express.Router();

const { spendVoucher } = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/pay", authMiddleware, spendVoucher);

module.exports = router;