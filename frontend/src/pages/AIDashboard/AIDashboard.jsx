import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaShieldAlt, FaRobot, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaBrain } from "react-icons/fa";

const AIDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions");
      // Filter only transactions that went through the AI (offline scans)
      // Usually they will have a riskScore property, or we can just show all and handle missing scores
      const txs = res.data.transactions || [];
      setTransactions(txs.filter(tx => tx.riskScore !== undefined && tx.riskScore !== null));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Metrics
  const totalAnalyzed = transactions.length;
  const blockedCount = transactions.filter(tx => tx.status === "REJECTED").length;
  const avgRisk = totalAnalyzed > 0 
    ? (transactions.reduce((acc, tx) => acc + (tx.riskScore || 0), 0) / totalAnalyzed).toFixed(2)
    : 0;

  const getRiskColor = (score) => {
    if (score >= 0.8) return "bg-red-500";
    if (score >= 0.5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskText = (score) => {
    if (score >= 0.8) return "text-red-400";
    if (score >= 0.5) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-violet-600/20 rounded-2xl text-violet-400">
          <FaBrain className="text-3xl" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">AI Risk Engine</h1>
          <p className="text-gray-400 mt-1">Machine Learning Isolation Forest Model</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#161B33] p-6 rounded-3xl border border-gray-700/50 shadow-xl relative overflow-hidden">
          <FaShieldAlt className="absolute -right-4 -bottom-4 text-8xl text-gray-800/30" />
          <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">Total Scans Analyzed</p>
          <h2 className="text-5xl font-bold mt-4">{totalAnalyzed}</h2>
        </div>

        <div className="bg-gradient-to-r from-violet-900 to-indigo-900 p-6 rounded-3xl border border-violet-500/30 shadow-xl relative overflow-hidden">
          <FaRobot className="absolute -right-4 -bottom-4 text-8xl text-white/5" />
          <p className="text-violet-200 uppercase tracking-widest text-sm font-bold">Avg Model Risk Score</p>
          <h2 className="text-5xl font-bold mt-4 text-white">{(avgRisk * 100).toFixed(0)}%</h2>
        </div>

        <div className="bg-[#2c1313] p-6 rounded-3xl border border-red-500/30 shadow-xl relative overflow-hidden">
          <FaExclamationTriangle className="absolute -right-4 -bottom-4 text-8xl text-red-500/5" />
          <p className="text-red-300 uppercase tracking-widest text-sm font-bold">Anomalies Blocked</p>
          <h2 className="text-5xl font-bold mt-4 text-red-400">{blockedCount}</h2>
        </div>
      </div>

      {/* ML Transaction Log */}
      <div className="bg-[#161B33] rounded-3xl p-8 border border-gray-700/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <FaShieldAlt className="text-violet-400" /> Live Telemetry
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading AI telemetry...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400">No offline transactions have been analyzed by the ML engine yet. Sync an offline payment to see it here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="pb-4 font-semibold">Transaction ID</th>
                  <th className="pb-4 font-semibold">Amount</th>
                  <th className="pb-4 font-semibold">ML Risk Score</th>
                  <th className="pb-4 font-semibold">Anomaly Flags</th>
                  <th className="pb-4 font-semibold">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition">
                    <td className="py-4 font-mono text-sm text-gray-300">
                      {tx.transactionId.substring(0, 12)}...
                    </td>
                    <td className="py-4 font-bold">
                      ₹{tx.amount}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${getRiskText(tx.riskScore)} w-12`}>
                          {Math.round(tx.riskScore * 100)}%
                        </span>
                        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getRiskColor(tx.riskScore)}`} 
                            style={{ width: `${tx.riskScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {(!tx.anomalyFlags || tx.anomalyFlags.length === 0) ? (
                          <span className="text-gray-500 text-xs">Normal</span>
                        ) : (
                          tx.anomalyFlags.map((flag, idx) => (
                            <span 
                              key={idx} 
                              className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-mono"
                            >
                              {flag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      {tx.status === "REJECTED" ? (
                        <div className="flex items-center gap-2 text-red-400 font-semibold">
                          <FaTimesCircle /> Blocked
                        </div>
                      ) : tx.status === "REVIEW_NEEDED" ? (
                        <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                          <FaExclamationTriangle /> Review
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <FaCheckCircle /> Approved
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AIDashboard;
