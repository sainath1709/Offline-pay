const express = require("express");
const { getWallet, topupWallet } = require("../controllers/walletController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getWallet);
router.post("/topup", protect, topupWallet);

module.exports = router;