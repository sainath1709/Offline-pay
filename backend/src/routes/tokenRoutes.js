const express = require("express");

const {
    mintOfflineTokens
} = require("../controllers/tokenController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/mint", protect, mintOfflineTokens);

module.exports = router;