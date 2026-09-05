const Voucher = require("../models/Voucher");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { sendEmailReceipt } = require("../services/emailService");

/**
 * Handles batch syncing of offline transactions from a merchant.
 */
const syncTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;
        const merchantId = req.user._id;

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ success: false, message: "No transactions provided" });
        }

        console.log(`[SYNC] Received ${transactions.length} offline transactions from merchant ${merchantId}`);

        let successCount = 0;
        let failCount = 0;
        const results = [];

        // Call the AI Risk Engine Python microservice
        let riskAssessments = [];
        try {
            const aiResponse = await fetch("http://localhost:8000/analyze_risk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    merchantId: merchantId.toString(),
                    transactions: transactions
                })
            });
            
            if (aiResponse.ok) {
                riskAssessments = await aiResponse.json();
                console.log(`[AI] Received risk assessments for ${riskAssessments.length} transactions`);
            } else {
                console.error("[AI] Error from Risk Engine:", await aiResponse.text());
            }
        } catch (aiErr) {
            console.error("[AI] Failed to connect to Risk Engine:", aiErr.message);
            // Fallback: If AI is down, we approve but we could flag them all as REVIEW_NEEDED in production
        }

        // Map risk assessments by transactionId for quick lookup
        const riskMap = {};
        riskAssessments.forEach(assessment => {
            riskMap[assessment.transactionId] = assessment;
        });

        const crypto = require("crypto");

        for (const txData of transactions) {
            try {
                // 1. Verify Voucher exists
                const voucher = await Voucher.findOne({ voucherId: txData.voucherId });
                if (!voucher) {
                    throw new Error("Associated voucher not found");
                }

                // 2. Cryptographic Signature Validation
                // Reconstruct the message that the frontend signed: voucherId + owner + amount + qrNonce
                const messageToSign = txData.voucherId + voucher.owner + txData.amount + txData.qrNonce;
                
                const expectedSignature = crypto
                    .createHmac("sha256", voucher.voucherSecret)
                    .update(messageToSign)
                    .digest("hex");

                if (expectedSignature !== txData.signature) {
                    throw new Error("Cryptographic verification failed! Signature mismatch.");
                }

                // 3. Check if transaction already exists (double spend prevention)
                let transaction = await Transaction.findOne({ transactionId: txData.transactionId });
                if (transaction) {
                    if (transaction.status === "COMPLETED") {
                        throw new Error("Already synced and completed (Double Spend)");
                    }
                } else {
                    // Check if qrNonce was already used (Replay Attack Double Spend)
                    const existingNonce = await Transaction.findOne({ qrNonce: txData.qrNonce });
                    if (existingNonce) {
                        throw new Error("QR Code already used (Replay Attack)");
                    }
                    
                    // Create transaction retroactively since it was generated offline
                    transaction = await Transaction.create({
                        transactionId: txData.transactionId,
                        voucherId: txData.voucherId,
                        sender: voucher.owner,
                        amount: txData.amount,
                        qrNonce: txData.qrNonce,
                        status: "PENDING",
                        expiresAt: new Date(txData.expiresAt),
                        scannedAt: new Date(txData.timestamp)
                    });
                }

                // 4. Apply AI Risk Assessment
                const assessment = riskMap[txData.transactionId];
                let finalStatus = "COMPLETED";
                
                if (assessment) {
                    console.log(`[AI] Tx ${txData.transactionId} -> Score: ${assessment.riskScore}, Action: ${assessment.action}, Flags: ${assessment.anomalyFlags.join(",")}`);
                    
                    if (assessment.action === "REJECT") {
                        finalStatus = "REJECTED";
                    } else if (assessment.action === "REVIEW") {
                        finalStatus = "REVIEW_NEEDED";
                    }
                }

                // 5. Update Voucher status and balance atomically (only if not rejected)
                if (finalStatus !== "REJECTED") {
                    const updatedVoucher = await Voucher.findOneAndUpdate(
                        { 
                            _id: voucher._id, 
                            remainingValue: { $gte: txData.amount } 
                        },
                        { 
                            $inc: { remainingValue: -txData.amount }
                        },
                        { new: true }
                    );

                    if (!updatedVoucher) {
                        transaction.status = "FAILED";
                        await transaction.save();
                        throw new Error("Insufficient remaining voucher balance or concurrent transaction");
                    }

                    if (updatedVoucher.remainingValue === 0) {
                        updatedVoucher.status = "SPENT";
                        await updatedVoucher.save();
                    }
                }

                // 6. Update the transaction
                transaction.status = finalStatus;
                transaction.receiver = merchantId;
                transaction.completedAt = new Date();
                
                if (assessment) {
                    transaction.riskScore = assessment.riskScore;
                    transaction.anomalyFlags = assessment.anomalyFlags || [];
                }
                
                await transaction.save();

                // 6. Credit Merchant Wallet (ONLY IF APPROVED)
                if (finalStatus === "COMPLETED") {
                    const merchantWallet = await Wallet.findOne({ user: merchantId });
                    if (merchantWallet) {
                        merchantWallet.onlineBalance += transaction.amount;
                        merchantWallet.lastSyncedAt = new Date();
                        await merchantWallet.save();
                    }
                }

                // 7. Update Sender Sync Time
                const senderWallet = await Wallet.findOne({ user: transaction.sender });
                if (senderWallet) {
                    senderWallet.lastSyncedAt = new Date();
                    await senderWallet.save();
                }

                // 8. Send Email Receipt
                const senderUser = await User.findById(transaction.sender);
                if (senderUser && senderUser.email) {
                    const statusText = finalStatus === "COMPLETED" ? "Successful" : (finalStatus === "REJECTED" ? "Rejected" : "Pending Review");
                    const emailBody = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #4CAF50;">OfflinePay Receipt</h2>
                            <p>Hello <strong>${senderUser.name}</strong>,</p>
                            <p>Your offline transaction has been synced with the network.</p>
                            <hr />
                            <p><strong>Amount:</strong> ₹${transaction.amount}</p>
                            <p><strong>Status:</strong> ${statusText}</p>
                            <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
                            <hr />
                            <p style="font-size: 12px; color: #888;">This is an automated message from OfflinePay.</p>
                        </div>
                    `;
                    // Send asynchronously (no await) so it doesn't block the sync loop
                    sendEmailReceipt(senderUser.email, `OfflinePay Receipt: ₹${transaction.amount}`, emailBody);
                }

                successCount++;
                results.push({ 
                    transactionId: txData.transactionId, 
                    status: "SUCCESS",
                    finalStatus: finalStatus,
                    riskScore: assessment ? assessment.riskScore : null
                });

            } catch (err) {
                console.error(`[SYNC ERROR] tx ${txData.transactionId}:`, err.message);
                failCount++;
                results.push({ transactionId: txData.transactionId, status: "FAILED", reason: err.message });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Synced ${successCount} successfully, ${failCount} failed.`,
            results
        });

    } catch (error) {
        console.error("[SYNC FATAL ERROR]:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { syncTransactions };
