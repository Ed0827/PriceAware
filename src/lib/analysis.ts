import { createClient } from '@supabase/supabase-js';
import { CostAnalysis, Hospital, Procedure, ProcedureCost } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export function analyzeProcedureCosts(
  procedure: Procedure,
  hospitalCosts: { hospital: Hospital; cost: ProcedureCost }[]
): CostAnalysis {
  // Calculate average cost across all hospitals
  const averageCost = hospitalCosts.reduce((acc, curr) => acc + curr.cost.average_cost, 0) / hospitalCosts.length;
  
  // Find min and max costs
  const minCost = Math.min(...hospitalCosts.map(hc => hc.cost.min_cost));
  const maxCost = Math.max(...hospitalCosts.map(hc => hc.cost.max_cost));
  
  // Determine overall cost trend
  const trends = hospitalCosts.map(hc => hc.cost.cost_trend);
  const risingCount = trends.filter(t => t === 'Rising').length;
  const decreasingCount = trends.filter(t => t === 'Decreasing').length;
  const costTrend = risingCount > decreasingCount ? 'Rising' :
                   decreasingCount > risingCount ? 'Decreasing' :
                   'Stable';
  
  // Sort hospitals by cost and distance
  const sortedHospitals = hospitalCosts
    .map(hc => ({
      hospital: hc.hospital,
      cost: hc.cost.average_cost,
      distance: parseFloat(hc.hospital.distance.replace(' miles', ''))
    }))
    .sort((a, b) => a.cost - b.cost);
  
  return {
    procedure,
    averageCost,
    minCost,
    maxCost,
    costTrend,
    hospitals: sortedHospitals
  };
}

export function findBestValueHospitals(
  hospitalCosts: { hospital: Hospital; cost: ProcedureCost }[],
  maxDistance: number = 50
): { hospital: Hospital; cost: ProcedureCost }[] {
  return hospitalCosts
    .filter(hc => parseFloat(hc.hospital.distance.replace(' miles', '')) <= maxDistance)
    .sort((a, b) => a.cost.average_cost - b.cost.average_cost);
}

export function calculateInsuranceSavings(
  procedure: Procedure,
  hospitalCosts: { hospital: Hospital; cost: ProcedureCost }[]
): { hospital: Hospital; savings: number }[] {
  return hospitalCosts.map(hc => ({
    hospital: hc.hospital,
    savings: hc.cost.average_cost - hc.cost.out_of_pocket_cost
  })).sort((a, b) => b.savings - a.savings);
}

// Analyze cost trend distribution across hospitals
export function analyzeCostTrendDistribution(
  hospitalCosts: { hospital: Hospital; cost: ProcedureCost }[]
): {
  rising: number;
  stable: number;
  decreasing: number;
} {
  const trends = hospitalCosts.map(hc => hc.cost.cost_trend);
  return {
    rising: trends.filter(t => t === 'Rising').length,
    stable: trends.filter(t => t === 'Stable').length,
    decreasing: trends.filter(t => t === 'Decreasing').length
  };
}

export function findMostAffordableHospitals(
  hospitalCosts: { hospital: Hospital; cost: ProcedureCost }[],
  insurance: string
): { hospital: Hospital; cost: ProcedureCost }[] {
  return hospitalCosts
    .filter(hc => hc.hospital.insurance.includes(insurance))
    .sort((a, b) => a.cost.out_of_pocket_cost - b.cost.out_of_pocket_cost);
}

// Compare procedure costs across different hospitals
export async function compareProcedureCosts(procedureName: string) {
  const { data: costs, error } = await supabase
    .from('procedure_costs')
    .select(`
      *,
      hospitals!inner (
        id,
        name,
        address,
        insurance,
        phone,
        distance
      )
    `)
    .eq('procedure_name', procedureName)
    .order('average_cost', { ascending: true });

  if (error) throw error;

  return costs.map(cost => ({
    ...cost,
    savingsOpportunity: cost.max_cost - cost.min_cost,
    costEffectivenessScore: (cost.insurance_coverage / cost.average_cost) * 100
  }));
}

// Analyze cost trends for a specific procedure
export async function analyzeCostTrends(procedureName: string) {
  const { data: costs, error } = await supabase
    .from('procedure_costs')
    .select('*')
    .eq('procedure_name', procedureName);

  if (error) throw error;

  const trends = {
    averageCost: costs.reduce((acc, curr) => acc + curr.average_cost, 0) / costs.length,
    minCost: Math.min(...costs.map(c => c.min_cost)),
    maxCost: Math.max(...costs.map(c => c.max_cost)),
    trend: costs[0]?.cost_trend || 'Unknown',
    explanation: costs[0]?.cost_explanation || '',
    variancePercentage: ((Math.max(...costs.map(c => c.max_cost)) - Math.min(...costs.map(c => c.min_cost))) / Math.min(...costs.map(c => c.min_cost))) * 100
  };

  return trends;
}

// Find most cost-effective hospitals
export async function findCostEffectiveHospitals(procedureName: string) {
  const { data: costs, error } = await supabase
    .from('procedure_costs')
    .select(`
      *,
      hospitals!inner (
        id,
        name,
        address,
        insurance,
        phone,
        distance
      )
    `)
    .eq('procedure_name', procedureName)
    .order('average_cost', { ascending: true });

  if (error) throw error;

  return costs.map(cost => ({
    ...cost,
    valueScore: (cost.insurance_coverage / cost.average_cost) * 100,
    potentialSavings: cost.max_cost - cost.average_cost
  }));
}

// Compare insurance coverage rates
export async function compareInsuranceCoverage() {
  const { data: procedures, error } = await supabase
    .from('procedures')
    .select('*');

  if (error) throw error;

  return procedures.map(procedure => ({
    ...procedure,
    coverageRate: (procedure.insurance_coverage / procedure.cost) * 100,
    outOfPocketPercentage: (procedure.out_of_pocket_cost / procedure.cost) * 100
  }));
}

// Get comprehensive cost analysis
export async function getComprehensiveCostAnalysis(procedureName: string) {
  const [costs, trends, hospitals, coverage] = await Promise.all([
    compareProcedureCosts(procedureName),
    analyzeCostTrends(procedureName),
    findCostEffectiveHospitals(procedureName),
    compareInsuranceCoverage()
  ]);

  return {
    costs,
    trends,
    hospitals,
    coverage: coverage.find(p => p.name === procedureName),
    summary: {
      averageCost: trends.averageCost,
      potentialSavings: Math.max(...costs.map(c => c.savingsOpportunity)),
      bestValueHospital: hospitals[0]?.hospital?.name || 'Unknown',
      coverageRate: coverage.find(p => p.name === procedureName)?.coverageRate || 0
    }
  };
}

// Get cost comparison metrics for visualization
export async function getCostComparisonMetrics(procedureName: string) {
  const analysis = await getComprehensiveCostAnalysis(procedureName);
  
  return {
    costDistribution: analysis.costs.map(cost => ({
      hospital: cost.hospital?.name || 'Unknown',
      averageCost: cost.average_cost,
      minCost: cost.min_cost,
      maxCost: cost.max_cost,
      insuranceCoverage: cost.insurance_coverage
    })),
    trends: {
      trend: analysis.trends.trend,
      variancePercentage: analysis.trends.variancePercentage,
      averageCost: analysis.trends.averageCost
    },
    rankings: analysis.hospitals.map(hospital => ({
      name: hospital.hospital?.name || 'Unknown',
      valueScore: hospital.valueScore,
      potentialSavings: hospital.potentialSavings
    })),
    insuranceAnalysis: {
      coverageRate: analysis.coverage?.coverageRate || 0,
      outOfPocketPercentage: analysis.coverage?.outOfPocketPercentage || 0
    }
  };
} 