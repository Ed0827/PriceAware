import { supabase } from '@/lib/supabase-client';

interface HistoricalCost {
  id: number;
  date: string;
  procedure_name: string;
  average_cost: number;
  cost_trend: string;
  zip_code: number;
}

interface ForecastResult {
  procedure_name: string;
  zip_code: number;
  historical_data: HistoricalCost[];
  forecast: {
    date: string;
    predicted_cost: number;
    lower_bound: number;
    upper_bound: number;
  }[];
  trend: 'Rising' | 'Stable' | 'Decreasing';
  confidence: number;
}

/**
 * Simple implementation of Exponential Smoothing with Trend (Holt's method)
 * This is a simplified version of ETS without seasonality
 */
function exponentialSmoothing(data: number[], alpha: number = 0.3, beta: number = 0.1): {
  forecast: number[];
  trend: number[];
} {
  if (data.length < 2) {
    return { forecast: data, trend: [0] };
  }

  // Initialize
  const forecast: number[] = [data[0]];
  const trend: number[] = [data[1] - data[0]];
  
  // Calculate forecasts
  for (let i = 1; i < data.length; i++) {
    const level = alpha * data[i] + (1 - alpha) * (forecast[i - 1] + trend[i - 1]);
    const newTrend = beta * (level - forecast[i - 1]) + (1 - beta) * trend[i - 1];
    
    forecast.push(level);
    trend.push(newTrend);
  }
  
  return { forecast, trend };
}

/**
 * Generate forecasts for the next n periods
 */
function generateForecast(
  data: number[], 
  dates: string[], 
  periods: number = 6,
  alpha: number = 0.3,
  beta: number = 0.1
): {
  forecast: number[];
  trend: number[];
  forecastDates: string[];
} {
  const { forecast, trend } = exponentialSmoothing(data, alpha, beta);
  
  // Get the last date
  const lastDate = new Date(dates[dates.length - 1]);
  
  // Generate future dates
  const forecastDates: string[] = [];
  for (let i = 1; i <= periods; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + i);
    forecastDates.push(nextDate.toISOString().split('T')[0]);
  }
  
  // Generate future forecasts
  const futureForecast: number[] = [];
  const lastLevel = forecast[forecast.length - 1];
  const lastTrendValue = trend[trend.length - 1];
  
  for (let i = 1; i <= periods; i++) {
    futureForecast.push(lastLevel + i * lastTrendValue);
  }
  
  return {
    forecast: [...forecast, ...futureForecast],
    trend: [...trend, ...Array(periods).fill(lastTrendValue)],
    forecastDates: [...dates, ...forecastDates]
  };
}

/**
 * Calculate confidence intervals for the forecast
 */
function calculateConfidenceIntervals(
  forecast: number[],
  historicalData: number[],
  confidenceLevel: number = 0.95
): { lower: number[]; upper: number[] } {
  // Calculate the standard deviation of the historical data
  const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
  const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
  const stdDev = Math.sqrt(variance);
  
  // Z-score for 95% confidence interval is approximately 1.96
  const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;
  
  // Calculate the margin of error
  const marginOfError = zScore * stdDev;
  
  // Apply the margin of error to the forecast
  const lower = forecast.map(f => Math.max(0, f - marginOfError));
  const upper = forecast.map(f => f + marginOfError);
  
  return { lower, upper };
}

/**
 * Determine the overall trend based on the forecast
 */
function determineTrend(forecast: number[], historicalData: number[]): 'Rising' | 'Stable' | 'Decreasing' {
  if (forecast.length < 2) return 'Stable';
  
  // Calculate the percentage change from the last historical value to the last forecast value
  const lastHistoricalValue = historicalData[historicalData.length - 1];
  const lastForecastValue = forecast[forecast.length - 1];
  const percentChange = ((lastForecastValue - lastHistoricalValue) / lastHistoricalValue) * 100;
  
  if (percentChange > 5) return 'Rising';
  if (percentChange < -5) return 'Decreasing';
  return 'Stable';
}

/**
 * Calculate the confidence level based on the historical data
 */
function calculateConfidence(historicalData: number[]): number {
  // More data points and less variance = higher confidence
  if (historicalData.length < 6) return 0.7; // Low confidence with few data points
  
  const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
  const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;
  
  // Lower coefficient of variation = higher confidence
  if (coefficientOfVariation < 0.05) return 0.95;
  if (coefficientOfVariation < 0.1) return 0.9;
  if (coefficientOfVariation < 0.15) return 0.85;
  return 0.8;
}

/**
 * Fetch historical cost data from Supabase and generate forecasts
 */
export async function forecastProcedureCosts(
  procedureName: string,
  zipCode: number,
  periods: number = 6
): Promise<ForecastResult> {
  try {
    // Fetch historical data from Supabase
    const { data, error } = await supabase
      .from('historical_procedure_costs')
      .select('*')
      .eq('procedure_name', procedureName)
      .eq('zip_code', zipCode)
      .order('date', { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`No historical data found for ${procedureName} in zip code ${zipCode}`);
    }
    
    // Extract costs and dates
    const costs = data.map(item => item.average_cost);
    const dates = data.map(item => item.date);
    
    // Generate forecast
    const { forecast, trend, forecastDates } = generateForecast(costs, dates, periods);
    
    // Calculate confidence intervals
    const { lower, upper } = calculateConfidenceIntervals(forecast, costs);
    
    // Determine overall trend
    const overallTrend = determineTrend(forecast, costs);
    
    // Calculate confidence level
    const confidence = calculateConfidence(costs);
    
    // Format the result
    const result: ForecastResult = {
      procedure_name: procedureName,
      zip_code: zipCode,
      historical_data: data,
      forecast: forecastDates.slice(dates.length).map((date, i) => ({
        date,
        predicted_cost: Math.round(forecast[dates.length + i]),
        lower_bound: Math.round(lower[dates.length + i]),
        upper_bound: Math.round(upper[dates.length + i])
      })),
      trend: overallTrend,
      confidence
    };
    
    return result;
  } catch (error) {
    console.error('Error forecasting procedure costs:', error);
    throw error;
  }
}

/**
 * Get cost trend analysis for a procedure
 */
export async function getCostTrendAnalysis(
  procedureName: string,
  zipCode: number
): Promise<{
  procedure_name: string;
  zip_code: number;
  current_cost: number;
  trend: 'Rising' | 'Stable' | 'Decreasing';
  percent_change: number;
  forecast_next_month: number;
}> {
  try {
    // Fetch historical data from Supabase
    const { data, error } = await supabase
      .from('historical_procedure_costs')
      .select('*')
      .eq('procedure_name', procedureName)
      .eq('zip_code', zipCode)
      .order('date', { ascending: true });
    
    if (error) throw error;
    if (!data || data.length < 2) {
      throw new Error(`Insufficient historical data for ${procedureName} in zip code ${zipCode}`);
    }
    
    // Get the most recent data point
    const currentData = data[data.length - 1];
    const previousData = data[data.length - 2];
    
    // Calculate percent change
    const percentChange = ((currentData.average_cost - previousData.average_cost) / previousData.average_cost) * 100;
    
    // Generate a simple forecast for next month
    const { forecast } = generateForecast(
      data.map(item => item.average_cost),
      data.map(item => item.date),
      1
    );
    
    return {
      procedure_name: procedureName,
      zip_code: zipCode,
      current_cost: currentData.average_cost,
      trend: currentData.cost_trend as 'Rising' | 'Stable' | 'Decreasing',
      percent_change: percentChange,
      forecast_next_month: Math.round(forecast[forecast.length - 1])
    };
  } catch (error) {
    console.error('Error analyzing cost trends:', error);
    throw error;
  }
} 