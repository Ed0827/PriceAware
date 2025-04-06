import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Available ZIP codes in our database
const AVAILABLE_ZIP_CODES = ['10001', '10002', '10003'];

// ETS (Error, Trend, Seasonal) forecasting model
function etsForecast(historicalData: any[], periods: number = 12) {
  if (historicalData.length < 2) {
    return [];
  }

  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extract costs and calculate trend
  const costs = sortedData.map(d => d.average_cost);
  const dates = sortedData.map(d => d.date);
  
  // Calculate trend using linear regression
  const n = costs.length;
  const xMean = (n - 1) / 2;
  const yMean = costs.reduce((sum, cost) => sum + cost, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (costs[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  // Calculate seasonal factors (monthly)
  const seasonalFactors = new Array(12).fill(0);
  const seasonalCounts = new Array(12).fill(0);
  
  for (let i = 0; i < n; i++) {
    const month = new Date(dates[i]).getMonth();
    const detrendedValue = costs[i] - (slope * i + intercept);
    seasonalFactors[month] += detrendedValue;
    seasonalCounts[month]++;
  }
  
  for (let i = 0; i < 12; i++) {
    if (seasonalCounts[i] > 0) {
      seasonalFactors[i] /= seasonalCounts[i];
    }
  }
  
  // Calculate error component (residuals)
  const errors = costs.map((cost, i) => {
    const month = new Date(dates[i]).getMonth();
    const trend = slope * i + intercept;
    const seasonal = seasonalFactors[month];
    return cost - (trend + seasonal);
  });
  
  const errorStd = Math.sqrt(
    errors.reduce((sum, error) => sum + error * error, 0) / (n - 2)
  );
  
  // Generate forecast
  const forecast = [];
  const lastDate = new Date(dates[dates.length - 1]);
  
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(lastDate.getMonth() + i);
    
    const month = forecastDate.getMonth();
    const trend = slope * (n + i - 1) + intercept;
    const seasonal = seasonalFactors[month];
    
    // Add some randomness based on error standard deviation
    const randomError = (Math.random() - 0.5) * errorStd;
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      cost: Math.round(trend + seasonal + randomError),
      lowerBound: Math.round(trend + seasonal - 1.96 * errorStd),
      upperBound: Math.round(trend + seasonal + 1.96 * errorStd)
    });
  }
  
  return forecast;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const procedureName = searchParams.get('procedure');
    const zipCode = searchParams.get('zipCode');
    
    console.log(`Forecast request for procedure: ${procedureName}, zipCode: ${zipCode}`);
    
    if (!procedureName || !zipCode) {
      console.error('Missing required parameters:', { procedureName, zipCode });
      return NextResponse.json(
        { error: 'Procedure name and zip code are required' },
        { status: 400 }
      );
    }
    
    // Get procedure ID
    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .select('id')
      .eq('name', procedureName)
      .single();
    
    if (procedureError) {
      console.error('Error fetching procedure:', procedureError);
      return NextResponse.json(
        { error: `Procedure not found: ${procedureName}`, details: procedureError.message },
        { status: 404 }
      );
    }
    
    if (!procedure) {
      console.error(`Procedure not found: ${procedureName}`);
      return NextResponse.json(
        { error: `Procedure not found: ${procedureName}` },
        { status: 404 }
      );
    }
    
    console.log(`Found procedure ID: ${procedure.id} for ${procedureName}`);
    
    // Check if the requested ZIP code exists in our database
    let effectiveZipCode = zipCode;
    let usingFallbackZipCode = false;
    
    if (!AVAILABLE_ZIP_CODES.includes(zipCode)) {
      console.log(`ZIP code ${zipCode} not found in database, using fallback ZIP code`);
      // Use the first available ZIP code as a fallback
      effectiveZipCode = AVAILABLE_ZIP_CODES[0];
      usingFallbackZipCode = true;
    }
    
    // Get historical cost data
    const { data: historicalData, error: historyError } = await supabase
      .from('historical_procedure_costs')
      .select('date, average_cost, cost_trend')
      .eq('procedure_id', procedure.id)
      .eq('zip_code', effectiveZipCode)
      .order('date', { ascending: true });
    
    if (historyError) {
      console.error('Error fetching historical data:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch historical data', details: historyError.message },
        { status: 500 }
      );
    }
    
    if (!historicalData || historicalData.length === 0) {
      console.error(`No historical data found for procedure: ${procedureName}, zipCode: ${effectiveZipCode}`);
      return NextResponse.json(
        { error: `No historical data available for ${procedureName} in zip code ${effectiveZipCode}` },
        { status: 404 }
      );
    }
    
    console.log(`Found ${historicalData.length} historical data points`);
    
    // Generate forecast
    const forecast = etsForecast(historicalData);
    console.log(`Generated ${forecast.length} forecast points`);
    
    return NextResponse.json({
      historical: historicalData,
      forecast,
      metadata: {
        requestedZipCode: zipCode,
        effectiveZipCode,
        usingFallbackZipCode
      }
    });
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 