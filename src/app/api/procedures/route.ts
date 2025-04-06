import { getProcedures } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const procedures = await getProcedures();
    return NextResponse.json(procedures);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    
    // Fallback to mock data
    try {
      const mockResponse = await fetch(new URL('/api/mock-data?type=procedures', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
      const mockData = await mockResponse.json();
      return NextResponse.json(mockData);
    } catch (mockError) {
      console.error('Error fetching mock data:', mockError);
      return NextResponse.json({ 
        error: 'Failed to fetch procedures',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
}