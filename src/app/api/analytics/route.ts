import { getComprehensiveCostAnalysis, getCostComparisonMetrics } from '@/lib/analysis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const procedureName = searchParams.get('procedure');
    const type = searchParams.get('type') || 'comprehensive';

    if (!procedureName) {
      return NextResponse.json({ 
        error: 'Procedure name is required'
      }, { status: 400 });
    }

    let data;
    if (type === 'metrics') {
      data = await getCostComparisonMetrics(procedureName);
    } else {
      data = await getComprehensiveCostAnalysis(procedureName);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 