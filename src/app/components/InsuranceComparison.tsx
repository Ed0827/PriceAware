'use client';

import { InsuranceComparison as InsuranceComparisonType } from '@/lib/types';
import { useEffect, useState } from 'react';

interface InsuranceComparisonProps {
  procedureName: string;
  zipCode: string;
}

export default function InsuranceComparison({ procedureName, zipCode }: InsuranceComparisonProps) {
  const [comparisons, setComparisons] = useState<InsuranceComparisonType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Auto-fetch comparisons when component mounts or props change
  useEffect(() => {
    if (procedureName && zipCode) {
      handleCompare();
    }
  }, [procedureName, zipCode]);

  const handleCompare = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/insurance/compare?procedure=${encodeURIComponent(procedureName)}&zipCode=${zipCode}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch insurance comparisons');
      }
      
      const data = await response.json();
      setComparisons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderFilter = (provider: string) => {
    setSelectedProvider(provider);
  };

  // Get unique providers for filter
  const providers = Array.from(new Set(comparisons.map(c => c.plan.provider_name)));

  // Filter comparisons by selected provider
  const filteredComparisons = selectedProvider
    ? comparisons.filter(c => c.plan.provider_name === selectedProvider)
    : comparisons;

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

  if (comparisons.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        No insurance plans found for this procedure in your area.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl p-6 space-y-6 border border-gray-800">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="procedureName" className="block text-sm font-medium text-gray-300 mb-1">
            Procedure
          </label>
          <input
            type="text"
            id="procedureName"
            value={procedureName}
            readOnly
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            readOnly
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <button
          onClick={handleCompare}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Provider filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleProviderFilter('')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedProvider === '' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Providers
        </button>
        {providers.map(provider => (
          <button
            key={provider}
            onClick={() => handleProviderFilter(provider)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedProvider === provider 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {provider}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {filteredComparisons.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Insurance Plans</h3>
          <div className="grid gap-4">
            {filteredComparisons.map((comparison) => (
              <div
                key={comparison.plan.id}
                className="bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{comparison.plan.provider_name}</h4>
                    <p className="text-sm text-gray-400">{comparison.plan.plan_name}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-900/50 text-indigo-200 rounded-full text-sm font-medium border border-indigo-800">
                    {comparison.plan.plan_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Annual Premium</p>
                    <p className="text-lg font-semibold text-white">
                      ${comparison.plan.annual_premium.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Out-of-Pocket Cost</p>
                    <p className="text-lg font-semibold text-white">
                      ${comparison.out_of_pocket_cost.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Coverage</p>
                    <p className="text-lg font-semibold text-white">
                      {comparison.coverage.coverage_percentage}%
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Annual Savings</p>
                    <p className="text-lg font-semibold text-indigo-400">
                      ${comparison.annual_savings.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deductible: ${comparison.plan.annual_deductible.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Coinsurance: {comparison.plan.coinsurance_percentage}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prior Auth: {comparison.coverage.prior_authorization_required ? 'Required' : 'Not Required'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 