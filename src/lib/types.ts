export interface Procedure {
  id: string | number;
  name: string;
  description: string;
  category?: string;
  matchScore?: number;
  recovery_time?: string;
  success_rate?: string;
  risks?: string;
  cost?: number;
  insurance_coverage?: number;
  out_of_pocket_cost?: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  type: string;
  rating: number;
  distance: number;
  insurance?: string[];
  cost: {
    average_cost: number;
    min_cost: number;
    max_cost: number;
    insurance_coverage: number;
    out_of_pocket_cost: number;
    cost_trend?: string;
    cost_explanation?: string;
  };
}

export interface ProcedureCost {
  id: number;
  procedure_name: string;
  average_cost: number;
  min_cost: number;
  max_cost: number;
  insurance_coverage: number;
  out_of_pocket_cost: number;
  cost_trend: 'Stable' | 'Rising' | 'Decreasing';
  cost_explanation: string;
  zip_code: string;
}

export interface CostComparison {
  procedure: Procedure;
  hospitalCosts: {
    hospital: Hospital;
    cost: ProcedureCost;
  }[];
}

export interface CostAnalysis {
  procedure: Procedure;
  averageCost: number;
  minCost: number;
  maxCost: number;
  costTrend: string;
  hospitals: {
    hospital: Hospital;
    cost: number;
    distance: number;
  }[];
}

export interface InsurancePlan {
  id: string;
  provider_name: string;
  plan_name: string;
  plan_type: string;
  annual_premium: number;
  annual_deductible: number;
  coinsurance_percentage: number;
  copay_amount: number | null;
  out_of_pocket_max: number;
  created_at: string;
  updated_at: string;
}

export interface ProcedureCoverage {
  id: string;
  insurance_plan_id: string;
  procedure_id: string | number;
  coverage_percentage: number;
  prior_authorization_required: boolean;
  network_status: 'in-network' | 'out-of-network' | 'both';
  created_at: string;
  updated_at: string;
}

export interface InsuranceComparison {
  plan: InsurancePlan;
  coverage: ProcedureCoverage;
  estimated_cost: number;
  out_of_pocket_cost: number;
  annual_savings: number;
} 