import { createClient } from '@supabase/supabase-js';
import { Hospital, Procedure, ProcedureCost } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Log environment variables (without exposing the full key)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getProcedures() {
  try {
    const { data, error } = await supabase
      .from('procedures')
      .select('*');
    
    if (error) {
      console.error('Supabase error in getProcedures:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No procedures data returned from Supabase');
      return [];
    }
    
    return data as Procedure[];
  } catch (error) {
    console.error('Error in getProcedures:', error);
    throw error;
  }
}

export async function getHospitals() {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*');
    
    if (error) {
      console.error('Supabase error in getHospitals:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No hospitals data returned from Supabase');
      return [];
    }
    
    return data as Hospital[];
  } catch (error) {
    console.error('Error in getHospitals:', error);
    throw error;
  }
}

export async function getProcedureCosts() {
  const { data, error } = await supabase
    .from('procedure_costs')
    .select('*');
  
  if (error) throw error;
  return data as ProcedureCost[];
}

export async function getProcedureCostsByZipCode(zipCode: string) {
  const { data, error } = await supabase
    .from('procedure_costs')
    .select('*')
    .eq('zip_code', zipCode);
  
  if (error) throw error;
  return data as ProcedureCost[];
}

export async function getHospitalsByInsurance(insurance: string) {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .contains('insurance', [insurance]);
  
  if (error) throw error;
  return data as Hospital[];
}

export async function getProcedureCostsByProcedure(procedureName: string) {
  const { data, error } = await supabase
    .from('procedure_costs')
    .select('*')
    .eq('procedure_name', procedureName);
  
  if (error) throw error;
  return data as ProcedureCost[];
} 