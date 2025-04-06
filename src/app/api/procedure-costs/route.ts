import { getProcedureCosts, getProcedureCostsByProcedure, getProcedureCostsByZipCode } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const procedureName = searchParams.get('procedure');
    const zipCode = searchParams.get('zipCode');

    if (procedureName) {
      const costs = await getProcedureCostsByProcedure(procedureName);
      return NextResponse.json(costs);
    }

    if (zipCode) {
      const costs = await getProcedureCostsByZipCode(zipCode);
      return NextResponse.json(costs);
    }

    const costs = await getProcedureCosts();
    return NextResponse.json(costs);
  } catch (error) {
    console.error('Error fetching procedure costs:', error);
    
    // Fallback to mock data
    try {
      const mockResponse = await fetch(new URL('/api/mock-data?type=procedure-costs', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
      const mockData = await mockResponse.json();
      return NextResponse.json(mockData);
    } catch (mockError) {
      console.error('Error fetching mock data:', mockError);
      return NextResponse.json({ 
        error: 'Failed to fetch procedure costs',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
} 