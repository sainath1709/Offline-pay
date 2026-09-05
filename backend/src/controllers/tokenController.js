const { mintTokens } = require("../services/tokenService");

const mintOfflineTokens = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required"
            });
        }

        const tokens = await mintTokens(
            req.user._id,
            amount
        );

        return res.status(201).json({
            success: true,
            message: "Offline tokens minted successfully",
            totalAmount: amount,
            tokenCount: tokens.length,
            tokens
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Token minting failed",
            error: error.message
        });
    }
};

module.exports = {
    mintOfflineTokens
};