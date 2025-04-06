'use client';

import { getProcedureCosts } from '@/lib/supabase-client';
import { LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CostAnalyticsProps {
  procedureName: string;
}

interface HistoricalCost {
  id: number;
  date: string;
  procedure_name: string;
  average_cost: number;
  cost_trend: string;
  zip_code: string;
}

export default function CostAnalytics({ procedureName }: CostAnalyticsProps) {
  const [costs, setCosts] = useState<HistoricalCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCosts() {
      try {
        const data = await getProcedureCosts(procedureName);
        setCosts(data);
      } catch (err) {
        setError('Failed to load cost analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCosts();
  }, [procedureName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!costs.length) return null;

  // Calculate overall metrics
  const latestCost = costs[0]; // Most recent cost
  const averageCost = costs.reduce((sum, cost) => sum + cost.average_cost, 0) / costs.length;
  const minCost = Math.min(...costs.map(cost => cost.average_cost));
  const maxCost = Math.max(...costs.map(cost => cost.average_cost));
  const variance = ((maxCost - minCost) / averageCost) * 100;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Prepare data for the chart
  const chartData = costs.map(cost => ({
    date: formatDate(cost.date),
    cost: cost.average_cost,
    trend: cost.cost_trend
  })).reverse(); // Reverse to show oldest to newest

  return (
    <div className="space-y-8">
      {/* Current Cost */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Current Cost</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Latest Average Cost</p>
            <p className="text-2xl font-medium">${latestCost.average_cost.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{formatDate(latestCost.date)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Cost Trend</p>
            <div className="flex items-center">
              <p className="text-xl font-medium">{latestCost.cost_trend}</p>
              {latestCost.cost_trend === 'Rising' ? (
                <TrendingUp className="ml-2 h-5 w-5 text-red-500" />
              ) : latestCost.cost_trend === 'Decreasing' ? (
                <TrendingDown className="ml-2 h-5 w-5 text-green-500" />
              ) : (
                <LineChart className="ml-2 h-5 w-5 text-blue-500" />
              )}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Zip Code</p>
            <p className="text-xl font-medium">{latestCost.zip_code}</p>
          </div>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Cost Trend Over Time</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

     

      {/* Cost Analysis */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Average Cost</p>
            <p className="text-xl font-medium">${averageCost.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Cost Range</p>
            <p className="text-xl font-medium">
              ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400">Variance</p>
            <p className="text-xl font-medium">{variance.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
} 