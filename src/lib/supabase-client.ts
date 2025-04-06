import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Function to get procedures based on symptoms
export async function getProceduresBySymptoms(symptoms: string) {
  try {
    // This is a placeholder query - adjust based on your actual table structure
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .textSearch('description', symptoms)
      .limit(5)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return []
  }
}

// Function to get hospitals by insurance and zip code
export async function getHospitalsByInsuranceAndZipCode(insurance: string, zipCode: string) {
  try {
    // This is a placeholder query - adjust based on your actual table structure
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .contains('insurance', [insurance])
      .ilike('zipCode', `${zipCode}%`)
      .limit(10)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return []
  }
}

interface HistoricalCost {
  id: number;
  date: string;
  procedure_name: string;
  average_cost: number;
  cost_trend: string;
  zip_code: string;
}

// Function to get procedure costs
export async function getProcedureCosts(procedureName: string): Promise<HistoricalCost[]> {
  const { data, error } = await supabase
    .from('historical_procedure_costs')
    .select('id, date, procedure_name, average_cost, cost_trend, zip_code')
    .eq('procedure_name', procedureName)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching procedure costs:', error);
    throw error;
  }

  return data || [];
}

// Function to get insurance providers
export async function getInsuranceProviders() {
  try {
    const { data, error } = await supabase
      .from('insurance_providers')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching insurance providers:', error)
    return []
  }
}

// Function to get insurance coverage for a procedure
export async function getInsuranceCoverage(procedureId: string, insuranceProviderId: string) {
  try {
    const { data, error } = await supabase
      .from('insurance_coverage')
      .select('*')
      .eq('procedure_id', procedureId)
      .eq('insurance_provider_id', insuranceProviderId)
      .single()
    
    if (error) throw error
    return data || null
  } catch (error) {
    console.error('Error fetching insurance coverage:', error)
    return null
  }
} 