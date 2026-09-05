const Transaction = require("../models/Transaction");

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Total Offline Revenue (where user is receiver and status is COMPLETED)
        const revenueTransactions = await Transaction.find({
            receiver: userId,
            status: { $in: ["COMPLETED", "SUCCESS"] }
        });
        const totalRevenue = revenueTransactions.reduce((acc, tx) => acc + tx.amount, 0);

        // 2. Total Offline Spent (where user is sender and status is COMPLETED)
        const spentTransactions = await Transaction.find({
            sender: userId,
            status: { $in: ["COMPLETED", "SUCCESS"] }
        });
        const totalSpent = spentTransactions.reduce((acc, tx) => acc + tx.amount, 0);

        // 3. Pending Transactions Count (Sender or Receiver)
        const pendingCount = await Transaction.countDocuments({
            $or: [{ sender: userId }, { receiver: userId }],
            status: "PENDING"
        });

        // 4. 7-Day History Chart Data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentTransactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }],
            createdAt: { $gte: sevenDaysAgo },
            status: { $in: ["COMPLETED", "SUCCESS"] }
        });

        // Initialize array for the last 7 days
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartData.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                Revenue: 0,
                Spent: 0,
                dateStr: d.toDateString() // for matching
            });
        }

        // Aggregate transactions into the correct day bucket
        recentTransactions.forEach(tx => {
            const txDateStr = new Date(tx.createdAt).toDateString();
            const dayBucket = chartData.find(d => d.dateStr === txDateStr);
            if (dayBucket) {
                if (tx.receiver && tx.receiver.toString() === userId.toString()) {
                    dayBucket.Revenue += tx.amount;
                } else if (tx.sender && tx.sender.toString() === userId.toString()) {
                    dayBucket.Spent += tx.amount;
                }
            }
        });

        res.status(200).json({
            success: true,
            totalRevenue,
            totalSpent,
            pendingCount,
            chartData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching analytics",
            error: error.message
        });
    }
};

module.exports = {
    getAnalytics
};
