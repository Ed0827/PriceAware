import { searchSimilarSymptoms } from '@/lib/ml/vector-search';
import { supabase } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();
    console.log('Processing symptoms:', symptoms);

    // Search for similar symptoms using vector search
    const searchResults = await searchSimilarSymptoms(symptoms);
    console.log('Vector search returned', searchResults.length, 'results');
    console.log('Search results:', JSON.stringify(searchResults, null, 2));

    // Get unique procedure IDs from search results
    const procedureIds = Array.from(new Set(searchResults.map(result => result.id)));
    console.log('Procedure IDs:', procedureIds);

    // Fetch procedure details from Supabase
    const { data: procedures, error: proceduresError } = await supabase
      .from('procedures')
      .select(`
        id,
        name,
        description,
        category
      `)
      .in('id', procedureIds);

    if (proceduresError) {
      console.error('Error fetching procedures:', proceduresError);
      throw proceduresError;
    }

    console.log('Fetched procedures:', JSON.stringify(procedures, null, 2));

    // Combine search results with procedure details
    const results = searchResults.map(result => {
      // Find the procedure in the database
      const procedure = procedures?.find(p => p.id.toString() === result.id);
      
      // If we found a procedure, use it; otherwise, use the metadata from the search result
      return {
        id: result.id,
        score: result.score,
        procedure: procedure || {
          id: result.id,
          name: result.metadata.name,
          description: result.metadata.description,
          category: result.metadata.category
        }
      };
    });

    console.log('Final results:', JSON.stringify(results, null, 2));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in symptoms API:', error);
    return NextResponse.json(
      { error: 'Failed to process symptoms' },
      { status: 500 }
    );
  }
} 