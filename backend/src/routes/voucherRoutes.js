const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  mintVoucher,
  getVouchers,
generateVoucherQR
} = require("../controllers/voucherController");

router.post("/", protect, mintVoucher);
router.get("/", protect, getVouchers);
router.post("/:voucherId/qr", protect, generateVoucherQR);

module.exports = router;