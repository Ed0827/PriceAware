'use client';

import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import InsuranceComparison from '../components/InsuranceComparison';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const procedures = [
  { id: 'appendectomy', name: 'Appendectomy', description: 'Surgical removal of the appendix' },
  { id: 'colonoscopy', name: 'Colonoscopy', description: 'Examination of the colon using a flexible tube with a camera' },
  { id: 'mri', name: 'MRI Scan', description: 'Magnetic resonance imaging scan of the body' },
  { id: 'xray', name: 'X-Ray', description: 'Radiographic imaging of the body' },
  { id: 'ultrasound', name: 'Ultrasound', description: 'Imaging using sound waves' },
  { id: 'ct', name: 'CT Scan', description: 'Computed tomography scan of the body' }
];

// Available ZIP codes in our database
const AVAILABLE_ZIP_CODES = ['10001', '10002', '10003'];

export default function ComparePage() {
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!selectedProcedure || !zipCode) return;

      setLoading(true);
      setError('');
      setMetadata(null);

      try {
        const response = await fetch(
          `/api/forecast?procedure=${encodeURIComponent(selectedProcedure)}&zipCode=${encodeURIComponent(zipCode)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch forecast data');
        }

        const data = await response.json();
        setHistoricalData(data.historical);
        setForecastData(data.forecast);
        setMetadata(data.metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [selectedProcedure, zipCode]);

  const chartData = {
    labels: [
      ...historicalData.map(d => new Date(d.date).toLocaleDateString()),
      ...forecastData.map(d => new Date(d.date).toLocaleDateString())
    ],
    datasets: [
      {
        label: 'Historical Cost',
        data: historicalData.map(d => d.average_cost),
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        tension: 0.1, // Slight curve for smoother lines
        fill: false
      },
      {
        label: 'Forecasted Cost',
        data: [...Array(historicalData.length).fill(null), ...forecastData.map(d => d.cost)],
        borderColor: 'rgb(239, 68, 68)', // Red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'white',
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false
      },
      {
        label: 'Confidence Interval',
        data: [...Array(historicalData.length).fill(null), ...forecastData.map(d => d.upperBound)],
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        tension: 0.1
      },
      {
        label: 'Lower Bound',
        data: [...Array(historicalData.length).fill(null), ...forecastData.map(d => d.lowerBound)],
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Procedure Cost History and Forecast',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Cost ($)',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          padding: {
            top: 0,
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          },
          font: {
            size: 12
          },
          padding: 8
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          padding: {
            top: 10,
            bottom: 0
          }
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Procedure Cost Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Procedure</label>
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full p-2 border rounded bg-gray-800 text-white"
            >
              <option value="">Select a procedure...</option>
              {procedures.map((proc) => (
                <option key={proc.id} value={proc.name}>
                  {proc.name} - {proc.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ZIP Code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              className="w-full p-2 border rounded bg-gray-800 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Available ZIP codes: {AVAILABLE_ZIP_CODES.join(', ')}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : historicalData.length > 0 ? (
            <>
              {metadata?.usingFallbackZipCode && (
                <div className="mb-4 p-3 bg-yellow-900/50 text-yellow-200 rounded text-sm">
                  <p>Note: Data for ZIP code {metadata.requestedZipCode} is not available.</p>
                  <p>Showing data for ZIP code {metadata.effectiveZipCode} instead.</p>
                </div>
              )}
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center h-64 flex items-center justify-center">
              Select a procedure and enter ZIP code to view cost history and forecast
            </div>
          )}
        </div>
      </div>

      {selectedProcedure && zipCode && (
        <div className="mt-8">
          <InsuranceComparison
            procedureName={selectedProcedure}
            zipCode={metadata?.effectiveZipCode || zipCode}
          />
        </div>
      )}
    </div>
  );
} 