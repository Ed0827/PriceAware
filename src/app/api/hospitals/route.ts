import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    console.log('Starting hospital search...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const insurance = searchParams.get('insurance');
    const zipCode = searchParams.get('zipCode');
    const procedureName = searchParams.get('procedure');
    
    console.log('Search params:', { insurance, zipCode, procedureName });

    // If no parameters are provided, return an empty array
    if (!insurance && !zipCode) {
      return NextResponse.json({ 
        hospitals: [],
        message: 'No search criteria provided'
      });
    }

    // Build the query
    let query = supabase
      .from('hospitals')
      .select('*');

    // Add filters if provided
    if (insurance) {
      query = query.not('insurance', 'is', null).filter('insurance', 'cs', `{${insurance}}`);
    }
    if (zipCode) {
      query = query.eq('zip_code', zipCode);
    }

    console.log('Executing query...');
    // Execute the query
    const { data: hospitals, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        error: 'Query error',
        details: error.message
      }, { status: 500 });
    }

    console.log(`Found ${hospitals?.length || 0} hospitals`);

    // If a procedure name is provided, fetch the procedure costs
    let procedureCosts = [];
    if (procedureName && hospitals && hospitals.length > 0) {
      console.log(`Fetching costs for procedure: ${procedureName}`);
      
      // First, get the procedure ID
      const { data: procedureData, error: procedureError } = await supabase
        .from('procedures')
        .select('id')
        .eq('name', procedureName)
        .single();
      
      if (procedureError) {
        console.error('Error fetching procedure:', procedureError);
      } else if (procedureData) {
        const procedureId = procedureData.id;
        console.log(`Found procedure ID: ${procedureId}`);
        
        // Get the procedure costs for each hospital
        const { data: costsData, error: costsError } = await supabase
          .from('procedure_costs')
          .select(`
            *,
            insurance_coverage (
              coverage_percentage,
              prior_authorization_required
            )
          `)
          .eq('procedure_id', procedureId);
        
        if (costsError) {
          console.error('Error fetching procedure costs:', costsError);
        } else {
          procedureCosts = costsData || [];
          console.log(`Found ${procedureCosts.length} procedure costs`);
        }
      }
    }

    // Combine hospital data with procedure costs
    const hospitalsWithCosts = hospitals?.map(hospital => {
      const hospitalCost = procedureCosts.find(cost => cost.hospital_id === hospital.id);
      
      return {
        ...hospital,
        rating: hospital.rating || 0, // Use the rating field directly from the hospital
        cost: hospitalCost ? {
          average_cost: hospitalCost.average_cost,
          min_cost: hospitalCost.min_cost,
          max_cost: hospitalCost.max_cost,
          insurance_coverage: hospitalCost.insurance_coverage?.[0]?.coverage_percentage || 0,
          out_of_pocket_cost: hospitalCost.out_of_pocket_cost,
          cost_trend: hospitalCost.cost_trend,
          cost_explanation: hospitalCost.cost_explanation
        } : null
      };
    }) || [];

    // Return the data in a consistent format with a 'hospitals' property
    return NextResponse.json({ 
      hospitals: hospitalsWithCosts,
      count: hospitalsWithCosts.length
    });
  } catch (error) {
    console.error('Error in hospital search:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      hospitals: []
    }, { status: 500 });
  }
}