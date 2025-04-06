import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const procedureName = searchParams.get('procedure');
    const zipCode = searchParams.get('zipCode');
    
    if (!procedureName || !zipCode) {
      return NextResponse.json(
        { error: 'Procedure name and zip code are required' },
        { status: 400 }
      );
    }
    
    console.log(`Comparing insurance plans for procedure: ${procedureName} in ZIP: ${zipCode}`);
    
    // Get procedure ID
    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .select('id, name')
      .eq('name', procedureName)
      .single();
    
    if (procedureError || !procedure) {
      console.error('Error fetching procedure:', procedureError);
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      );
    }
    
    console.log(`Found procedure: ${procedure.name} (ID: ${procedure.id})`);
    
    // Get procedure cost for the zip code area
    const { data: procedureCosts, error: costError } = await supabase
      .from('procedure_costs')
      .select('average_cost, min_cost, max_cost')
      .eq('procedure_id', procedure.id);
    
    if (costError) {
      console.error('Error fetching procedure costs:', costError);
      return NextResponse.json(
        { error: 'Failed to fetch procedure costs' },
        { status: 500 }
      );
    }
    
    // Calculate average cost across all hospitals
    const averageCost = procedureCosts.length > 0 
      ? procedureCosts.reduce((sum, cost) => sum + cost.average_cost, 0) / procedureCosts.length
      : 0;
    
    console.log(`Average procedure cost: $${averageCost}`);
    
    // Get all insurance plans
    const { data: plans, error: plansError } = await supabase
      .from('insurance_plans')
      .select('*');
    
    if (plansError) {
      console.error('Error fetching insurance plans:', plansError);
      return NextResponse.json(
        { error: 'Failed to fetch insurance plans' },
        { status: 500 }
      );
    }
    
    console.log(`Found ${plans.length} insurance plans`);
    
    // Get procedure coverage for each plan
    const { data: coverageData, error: coverageError } = await supabase
      .from('procedure_coverage')
      .select('*')
      .eq('procedure_id', procedure.id);
    
    if (coverageError) {
      console.error('Error fetching procedure coverage:', coverageError);
      return NextResponse.json(
        { error: 'Failed to fetch procedure coverage' },
        { status: 500 }
      );
    }
    
    console.log(`Found ${coverageData.length} procedure coverage records`);
    
    // Create a map of insurance plan ID to coverage
    const coverageMap = new Map();
    coverageData.forEach(coverage => {
      coverageMap.set(coverage.insurance_plan_id, coverage);
    });
    
    // Calculate comparison data for each plan
    const comparisons = plans.map(plan => {
      const coverage = coverageMap.get(plan.id);
      
      if (!coverage) {
        return null; // Skip plans without coverage for this procedure
      }
      
      const coveragePercentage = coverage.coverage_percentage;
      const coverageAmount = (averageCost * coveragePercentage) / 100;
      const outOfPocketCost = Math.max(
        averageCost - coverageAmount + plan.deductible,
        0
      );
      
      // Calculate annual savings compared to paying full cost
      const annualSavings = averageCost - outOfPocketCost - plan.annual_premium;
      
      return {
        plan: {
          id: plan.id,
          provider_name: plan.provider,
          plan_name: plan.name,
          plan_type: plan.type,
          annual_premium: plan.annual_premium,
          annual_deductible: plan.deductible,
          coinsurance_percentage: plan.copay_percentage,
          copay_amount: null, // Not in our schema
          out_of_pocket_max: plan.deductible * 2, // Estimate based on deductible
          created_at: plan.created_at,
          updated_at: plan.updated_at
        },
        coverage: {
          id: coverage.id,
          insurance_plan_id: plan.id,
          procedure_id: procedure.id,
          coverage_percentage: coverage.coverage_percentage,
          prior_authorization_required: coverage.prior_authorization_required,
          network_status: 'in-network', // Default value
          created_at: coverage.created_at,
          updated_at: coverage.updated_at
        },
        estimated_cost: averageCost,
        out_of_pocket_cost: outOfPocketCost,
        annual_savings: annualSavings
      };
    }).filter(Boolean) as any[]; // Remove null entries and type assertion to fix linter error
    
    // Sort by annual savings (highest to lowest)
    comparisons.sort((a, b) => b.annual_savings - a.annual_savings);
    
    console.log(`Returning ${comparisons.length} insurance plan comparisons`);
    
    return NextResponse.json(comparisons);
  } catch (error) {
    console.error('Error comparing insurance plans:', error);
    return NextResponse.json(
      { error: 'Failed to compare insurance plans' },
      { status: 500 }
    );
  }
} 