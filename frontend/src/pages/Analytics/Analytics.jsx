import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import API from '../../services/api';

const Analytics = () => {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalSpent: 0,
    pendingCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get('/analytics');
        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-white p-8">Loading analytics...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#161B33] p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Offline Revenue</h3>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-green-400">₹{data.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-[#161B33] p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Offline Spent</h3>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-400">₹{data.totalSpent.toLocaleString()}</p>
        </div>

        <div className="bg-[#161B33] p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Pending Scans</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-yellow-400">{data.pendingCount}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#161B33] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold mb-6">7-Day Transaction History</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="Spent" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorSpent)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;