import { getInsuranceCoverage, getInsuranceProviders } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const procedureId = searchParams.get('procedureId');
    const insuranceProviderId = searchParams.get('insuranceProviderId');
    
    // If both procedureId and insuranceProviderId are provided, get coverage details
    if (procedureId && insuranceProviderId) {
      const coverage = await getInsuranceCoverage(procedureId, insuranceProviderId);
      return NextResponse.json({ coverage });
    }
    
    // Otherwise, get all insurance providers
    const providers = await getInsuranceProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error in insurance API:', error);
    return NextResponse.json(
      { error: 'Failed to get insurance information' },
      { status: 500 }
    );
  }
} 