'use client'

import { useState } from 'react'
import InsuranceComparison from './InsuranceComparison'

interface Hospital {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  website: string
  type: string
  rating: number
  distance?: string
  cost?: {
    average_cost: number
    min_cost: number
    max_cost: number
    insurance_coverage: number
    out_of_pocket_cost: number
    cost_trend: string
    cost_explanation: string
  }
}

interface HospitalFinderModalProps {
  onClose: () => void
  onSearch?: (insurance: string, zipCode: string) => void
  procedureName?: string
  isOpen?: boolean
}

export default function HospitalFinderModal({ onClose, onSearch, procedureName, isOpen = true }: HospitalFinderModalProps) {
  const [insurance, setInsurance] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInsuranceComparison, setShowInsuranceComparison] = useState(false)
  
  const handleSearch = async () => {
    if (!insurance || !zipCode) {
      setError('Please enter both insurance and zip code')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setHospitals([])
    
    try {
      console.log('Fetching hospitals with params:', { insurance, zipCode, procedureName });
      
      // Build the URL with all parameters
      let url = `/api/hospitals?insurance=${encodeURIComponent(insurance)}&zipCode=${encodeURIComponent(zipCode)}`;
      if (procedureName) {
        url += `&procedure=${encodeURIComponent(procedureName)}`;
      }
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.details || 'Failed to fetch hospitals');
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Check if data is an array (direct response) or an object with hospitals property
      if (Array.isArray(data)) {
        setHospitals(data);
        if (data.length === 0) {
          setError('No hospitals found with the specified criteria');
        }
      } else if (data.hospitals && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
        if (data.hospitals.length === 0) {
          setError('No hospitals found with the specified criteria');
        }
      } else {
        console.error('Invalid response format:', data);
        setError('Invalid response format from server');
      }
      
      if (onSearch) {
        onSearch(insurance, zipCode);
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch hospitals');
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Find Hospitals</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="insurance" className="block text-sm font-medium text-gray-300 mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                id="insurance"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="Enter your insurance provider"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your ZIP code"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Hospitals
                </>
              )}
            </button>
            
            {procedureName && (
              <button
                onClick={() => setShowInsuranceComparison(!showInsuranceComparison)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {showInsuranceComparison ? 'Hide Insurance Comparison' : 'Compare Insurance Plans'}
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          {/* Insurance Plan Comparison */}
          {showInsuranceComparison && procedureName && zipCode && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Insurance Plan Comparison</h3>
              <InsuranceComparison
                procedureName={procedureName}
                zipCode={zipCode}
              />
            </div>
          )}

          {hospitals.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Available Hospitals</h3>
              <div className="grid gap-6">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-700"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{hospital.name}</h4>
                        <p className="text-gray-400">{hospital.address}</p>
                        <p className="text-gray-400">{hospital.city}, {hospital.state} {hospital.zip_code}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href={`tel:${hospital.phone}`}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {hospital.phone}
                          </a>
                          <a
                            href={hospital.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Website
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium">{hospital.rating}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Distance: {hospital.distance} miles</p>
                      </div>
                    </div>

                    {hospital.cost && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h4 className="font-medium text-white mb-2">Cost Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Average Cost</p>
                            <p className="text-lg font-semibold text-white">
                              ${hospital.cost.average_cost?.toLocaleString() ?? 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Cost Range</p>
                            <p className="text-lg font-semibold text-white">
                              ${hospital.cost.min_cost?.toLocaleString() ?? 'N/A'} - ${hospital.cost.max_cost?.toLocaleString() ?? 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Insurance Coverage</p>
                            <p className="text-lg font-semibold text-white">
                              {hospital.cost.insurance_coverage ?? 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Out-of-Pocket Cost</p>
                            <p className="text-lg font-semibold text-white">
                              ${hospital.cost.out_of_pocket_cost?.toLocaleString() ?? 'N/A'}
                            </p>
                          </div>
                        </div>
                        {hospital.cost.cost_trend && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-400">Cost Trend</p>
                            <p className="text-lg font-semibold text-white">
                              {hospital.cost.cost_trend}
                            </p>
                            {hospital.cost.cost_explanation && (
                              <p className="text-sm text-gray-400 mt-1">
                                {hospital.cost.cost_explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              {isLoading ? 'Searching for hospitals...' : 'No hospitals found. Try adjusting your search criteria.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}