const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { generateQR } = require("../controllers/qrController");

router.post("/generate", protect, generateQR);

module.exports = router;