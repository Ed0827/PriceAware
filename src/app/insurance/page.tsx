"use client";

import { Loader2, Search, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface InsuranceProvider {
  id: string;
  name: string;
  description: string;
  website: string;
}

interface InsuranceCoverage {
  id: string;
  procedure_id: string;
  insurance_provider_id: string;
  coverage_percentage: number;
  copay: number;
  deductible_applies: boolean;
  notes: string;
}

export default function InsurancePage() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [coverage, setCoverage] = useState<InsuranceCoverage | null>(null);
  const [procedureId, setProcedureId] = useState<string>('');

  useEffect(() => {
    fetchInsuranceProviders();
  }, []);

  const fetchInsuranceProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insurance');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProviders(data.providers || []);
    } catch (err) {
      setError('Failed to load insurance providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoverage = async (providerId: string) => {
    if (!procedureId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/insurance?procedureId=${procedureId}&insuranceProviderId=${providerId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCoverage(data.coverage);
    } catch (err) {
      setError('Failed to load coverage information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: InsuranceProvider) => {
    setSelectedProvider(provider);
    fetchCoverage(provider.id);
  };

  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-white/10 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold">PriceAware+</span>
        </Link>
        <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
          About
        </Link>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Insurance Coverage</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search insurance providers..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Insurance Providers</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProviders.length === 0 ? (
                  <p className="text-gray-400">No insurance providers found</p>
                ) : (
                  filteredProviders.map(provider => (
                    <button
                      key={provider.id}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedProvider?.id === provider.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handleProviderSelect(provider)}
                    >
                      {provider.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedProvider ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">{selectedProvider.name}</h2>
                <div className="bg-white/5 p-4 rounded-lg mb-6">
                  <p className="mb-4">{selectedProvider.description}</p>
                  <a
                    href={selectedProvider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Visit website
                  </a>
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Coverage Information</h3>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : coverage ? (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400">Coverage Percentage</p>
                        <p className="text-2xl font-bold">{coverage.coverage_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Copay</p>
                        <p className="text-2xl font-bold">${coverage.copay}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-400">Deductible Applies</p>
                      <p className="font-medium">{coverage.deductible_applies ? 'Yes' : 'No'}</p>
                    </div>
                    {coverage.notes && (
                      <div>
                        <p className="text-gray-400">Notes</p>
                        <p>{coverage.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p>No coverage information available for this provider.</p>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Enter Procedure ID to check coverage
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Procedure ID"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={procedureId}
                          onChange={(e) => setProcedureId(e.target.value)}
                        />
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          onClick={() => fetchCoverage(selectedProvider.id)}
                        >
                          Check Coverage
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 p-8 rounded-lg text-center">
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select an Insurance Provider</h2>
                <p className="text-gray-400">
                  Choose an insurance provider from the list to view coverage information.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 