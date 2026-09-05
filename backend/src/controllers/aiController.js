const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

/**
 * Agentic AI Chat Controller
 * Parses natural language to extract intents and generate structured Action Proposals.
 */
const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        const lowerMsg = message.toLowerCase();

        // INTENT 1: CREATE VOUCHER (Agentic Workflow)
        // Matches: "create 500 voucher", "I need 500 offline", "make 1000 offline money"
        const createRegex = /(?:create|make|need|generate|keep|want).*?(?:₹|rs\.?|rupees?)?\s*(\d+).*?(?:offline|voucher)/i;
        const createRegexAlt = /(?:₹|rs\.?|rupees?)?\s*(\d+).*?(?:offline|voucher)/i;
        
        let amountMatch = lowerMsg.match(createRegex);
        if (!amountMatch && lowerMsg.includes("voucher") || lowerMsg.includes("offline")) {
            amountMatch = lowerMsg.match(createRegexAlt);
        }

        if ((lowerMsg.includes("create") || lowerMsg.includes("need") || lowerMsg.includes("make") || lowerMsg.includes("generate")) && amountMatch) {
            const amount = parseInt(amountMatch[1], 10);
            
            // Check wallet balance
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) return res.status(404).json({ success: false, error: "Wallet not found" });

            if (wallet.onlineBalance < amount) {
                return res.json({
                    success: true,
                    type: "TEXT",
                    message: `You requested a ₹${amount} offline voucher, but your online balance is only ₹${wallet.onlineBalance}. Please add funds first.`
                });
            }

            return res.json({
                success: true,
                type: "PROPOSAL",
                proposal: {
                    action: "CREATE_VOUCHER",
                    amount: amount,
                    onlineBalance: wallet.onlineBalance,
                    resultingBalance: wallet.onlineBalance - amount,
                    message: `I can help you create an offline voucher for ₹${amount}. This will deduct from your online balance. Please confirm to proceed.`
                }
            });
        }

        // INTENT 2: SPENDING INSIGHTS
        if (lowerMsg.includes("spend") || lowerMsg.includes("spent") || lowerMsg.includes("insight") || lowerMsg.includes("analyze")) {
            // Fetch recent offline transactions sent by this user
            const transactions = await Transaction.find({ sender: userId }).sort({ createdAt: -1 }).limit(10);
            
            if (transactions.length === 0) {
                return res.json({
                    success: true,
                    type: "TEXT",
                    message: "You haven't made any offline payments yet. Once you do, I can analyze your spending patterns!"
                });
            }

            const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);
            const avg = (total / transactions.length).toFixed(0);

            return res.json({
                success: true,
                type: "TEXT",
                message: `Based on your recent offline activity, you've spent ₹${total} across ${transactions.length} transactions. Your average offline payment is ₹${avg}. I recommend keeping at least a ₹${Number(avg) * 2} buffer in your offline voucher for emergencies.`
            });
        }

        // INTENT 3: AI EXPLANATION
        if (lowerMsg.includes("flagged") || lowerMsg.includes("rejected") || lowerMsg.includes("risk")) {
            return res.json({
                success: true,
                type: "TEXT",
                message: "Our AI Risk Engine uses an Isolation Forest ML model to detect anomalies. Payments may be flagged if the amount is extremely unusual compared to your history, if multiple failed attempts occur rapidly, or if the offline QR signature is invalid."
            });
        }

        // DEFAULT FALLBACK
        return res.json({
            success: true,
            type: "TEXT",
            message: "I am your Agentic AI Assistant. I can help you create offline vouchers, analyze your spending, and manage your risks. Try asking: 'Create a ₹500 offline voucher' or 'Analyze my spending'."
        });

    } catch (error) {
        console.error("[AI Chat Error]:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { chat };
