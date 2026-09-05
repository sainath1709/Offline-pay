const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");

// All AI routes require authentication
router.post("/chat", auth, chat);

module.exports = router;
