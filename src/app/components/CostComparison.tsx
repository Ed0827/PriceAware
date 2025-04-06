'use client'

import { CostComparison as CostComparisonType } from '../../lib/types'
import HospitalCard from './HospitalCard'

interface ProcedureCost {
  id: string
  name: string
  averageCost: number
  minCost: number
  maxCost: number
  insuranceCoverage: number
  outOfPocketCost: number
  costTrend: 'up' | 'down' | 'stable'
  costExplanation: string
}

interface CostComparisonProps {
  comparison: CostComparisonType
}

export default function CostComparison({ comparison }: CostComparisonProps) {
  const { procedure, hospitalCosts } = comparison

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{procedure.name}</h2>
        <p className="text-gray-600 mb-4">{procedure.description}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Average Cost</p>
            <p className="text-xl font-semibold">
              ${(hospitalCosts.reduce((acc, curr) => acc + curr.cost.average_cost, 0) / hospitalCosts.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Min Cost</p>
            <p className="text-xl font-semibold">
              ${Math.min(...hospitalCosts.map(hc => hc.cost.min_cost)).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Cost</p>
            <p className="text-xl font-semibold">
              ${Math.max(...hospitalCosts.map(hc => hc.cost.max_cost)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitalCosts.map((hc, index) => (
          <div key={index} className="space-y-4">
            <HospitalCard hospital={hc.hospital} />
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-2">Cost Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Cost:</span>
                  <span className="font-medium">${hc.cost.average_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Insurance Coverage:</span>
                  <span className="font-medium">${hc.cost.insurance_coverage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Out of Pocket:</span>
                  <span className="font-medium">${hc.cost.out_of_pocket_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trend:</span>
                  <span className={`font-medium ${
                    hc.cost.cost_trend === 'Rising' ? 'text-red-600' :
                    hc.cost.cost_trend === 'Decreasing' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {hc.cost.cost_trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 