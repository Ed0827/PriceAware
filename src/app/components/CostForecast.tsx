'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ForecastData {
  procedure_name: string;
  zip_code: number;
  historical_data: {
    id: number;
    date: string;
    procedure_name: string;
    average_cost: number;
    cost_trend: string;
    zip_code: number;
  }[];
  forecast: {
    date: string;
    predicted_cost: number;
    lower_bound: number;
    upper_bound: number;
  }[];
  trend: 'Rising' | 'Stable' | 'Decreasing';
  confidence: number;
}

interface CostForecastProps {
  procedureName: string;
  zipCode: number;
}

export default function CostForecast({ procedureName, zipCode }: CostForecastProps) {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/forecast?procedure=${encodeURIComponent(procedureName)}&zipCode=${zipCode}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch forecast data');
        }
        
        const data = await response.json();
        setForecastData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching forecast:', err);
      } finally {
        setLoading(false);
      }
    }

    if (procedureName && zipCode) {
      fetchForecast();
    }
  }, [procedureName, zipCode]);

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

  if (!forecastData) return null;

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Rising':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'Decreasing':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Calculate the maximum cost for the chart
  const maxCost = Math.max(
    ...forecastData.historical_data.map(d => d.average_cost),
    ...forecastData.forecast.map(f => f.upper_bound)
  );

  // Calculate the minimum cost for the chart
  const minCost = Math.min(
    ...forecastData.historical_data.map(d => d.average_cost),
    ...forecastData.forecast.map(f => f.lower_bound)
  );

  // Calculate the range for the chart
  const range = maxCost - minCost;
  const padding = range * 0.1; // 10% padding

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Cost Forecast</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Trend:</span>
          <div className="flex items-center">
            {getTrendIcon(forecastData.trend)}
            <span className="ml-1 text-sm font-medium">{forecastData.trend}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Confidence Level</span>
          <span className="text-sm font-medium">{Math.round(forecastData.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${forecastData.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="relative h-64 mb-6">
        {/* Chart */}
        <div className="absolute inset-0 flex items-end">
          {/* Historical data points */}
          {forecastData.historical_data.map((data, index) => {
            const position = ((data.average_cost - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100;
            return (
              <div
                key={`historical-${index}`}
                className="absolute bottom-0 w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${(index / (forecastData.historical_data.length - 1)) * 50}%`,
                  bottom: `${position}%`,
                }}
                title={`${formatDate(data.date)}: $${data.average_cost.toLocaleString()}`}
              />
            );
          })}
          
          {/* Forecast data points */}
          {forecastData.forecast.map((data, index) => {
            const position = ((data.predicted_cost - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100;
            const lowerPosition = ((data.lower_bound - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100;
            const upperPosition = ((data.upper_bound - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100;
            
            return (
              <div
                key={`forecast-${index}`}
                className="absolute bottom-0"
                style={{
                  left: `${50 + (index / (forecastData.forecast.length - 1)) * 50}%`,
                }}
              >
                {/* Confidence interval */}
                <div
                  className="w-1 bg-blue-500/20"
                  style={{
                    height: `${upperPosition - lowerPosition}%`,
                    bottom: `${lowerPosition}%`,
                  }}
                ></div>
                
                {/* Forecast point */}
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  style={{
                    bottom: `${position}%`,
                  }}
                  title={`${formatDate(data.date)}: $${data.predicted_cost.toLocaleString()} (${data.lower_bound.toLocaleString()} - ${data.upper_bound.toLocaleString()})`}
                ></div>
              </div>
            );
          })}
          
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            {/* Historical line */}
            <polyline
              points={forecastData.historical_data.map((data, index) => {
                const x = (index / (forecastData.historical_data.length - 1)) * 50;
                const y = 100 - (((data.average_cost - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            
            {/* Forecast line */}
            <polyline
              points={forecastData.forecast.map((data, index) => {
                const x = 50 + (index / (forecastData.forecast.length - 1)) * 50;
                const y = 100 - (((data.predicted_cost - (minCost - padding)) / (maxCost - minCost + 2 * padding)) * 100);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-400">
          <span>${maxCost.toLocaleString()}</span>
          <span>${Math.round((maxCost + minCost) / 2).toLocaleString()}</span>
          <span>${minCost.toLocaleString()}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 h-6 flex justify-between text-xs text-gray-400">
          <span>Historical</span>
          <span>Forecast</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Historical Data</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {forecastData.historical_data.map((data, index) => (
              <div key={`historical-row-${index}`} className="flex justify-between text-sm">
                <span>{formatDate(data.date)}</span>
                <span>${data.average_cost.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Forecast</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {forecastData.forecast.map((data, index) => (
              <div key={`forecast-row-${index}`} className="flex justify-between text-sm">
                <span>{formatDate(data.date)}</span>
                <span>
                  ${data.predicted_cost.toLocaleString()}
                  <span className="text-xs text-gray-400 ml-1">
                    (${data.lower_bound.toLocaleString()} - ${data.upper_bound.toLocaleString()})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 