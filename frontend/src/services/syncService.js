import API from "./api";

/**
 * Pushes all pending offline transactions to the backend.
 * This should be called when the device comes back online.
 */
export const syncOfflineTransactions = async () => {
    try {
        const queueStr = localStorage.getItem("offlinePendingTransactions");
        if (!queueStr) return { success: true, syncedCount: 0, message: "No pending transactions" };

        const queue = JSON.parse(queueStr);
        if (queue.length === 0) return { success: true, syncedCount: 0, message: "No pending transactions" };

        console.log(`Attempting to sync ${queue.length} offline transactions...`);

        // Send the entire batch to the new backend /sync endpoint
        const res = await API.post("/transactions/sync", { transactions: queue });

        // If successful, clear the local queue
        if (res.data.success) {
            localStorage.removeItem("offlinePendingTransactions");
            console.log("Sync successful!", res.data);
            return {
                success: true,
                syncedCount: queue.length,
                message: res.data.message
            };
        } else {
            throw new Error(res.data.message || "Sync failed on backend");
        }
    } catch (err) {
        console.error("Sync Error:", err);
        return {
            success: false,
            syncedCount: 0,
            message: err.response?.data?.error || err.message || "Network error during sync"
        };
    }
};
