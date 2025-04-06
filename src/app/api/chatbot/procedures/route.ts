import { supabase } from '@/lib/db';
import { searchSimilarSymptoms } from '@/lib/ml/vector-search';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();
    
    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }
    
    let procedures = [];
    let vectorSearchSuccessful = false;
    
    try {
      // Step 1: Try to use vector search with Qdrant
      console.log('Attempting vector search with Qdrant...');
      const similarSymptoms = await searchSimilarSymptoms(symptoms);
      
      // Step 2: Extract procedure IDs from similar symptoms
      const procedureIds = similarSymptoms.flatMap((result: any) => 
        result.payload.procedure_ids || []
      );
      
      if (procedureIds.length > 0) {
        // If we have procedure IDs from vector search, use them
        console.log('Found procedure IDs from vector search:', procedureIds);
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .in('id', procedureIds);
        
        if (error) throw error;
        procedures = data || [];
        vectorSearchSuccessful = true;
      }
    } catch (vectorError) {
      console.error('Vector search failed, falling back to text search:', vectorError);
      // Continue to fallback method
    }
    
    // Step 3: Fallback to text search if vector search failed or didn't return results
    if (!vectorSearchSuccessful || procedures.length === 0) {
      console.log('Using text search fallback...');
      try {
        // Sanitize the search query to avoid syntax errors
        const sanitizedQuery = symptoms.replace(/[^\w\s]/g, ' ').trim();
        
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .textSearch('description', sanitizedQuery)
          .limit(5);
        
        if (error) {
          console.error('Text search error:', error);
          // If text search fails, get all procedures as a last resort
          const { data: allData, error: allError } = await supabase
            .from('procedures')
            .select('*')
            .limit(5);
          
          if (allError) throw allError;
          procedures = allData || [];
        } else {
          procedures = data || [];
        }
      } catch (textSearchError) {
        console.error('Text search fallback failed:', textSearchError);
        // Get all procedures as a last resort
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        procedures = data || [];
      }
    }
    
    // Step 4: Get cost information for each procedure
    const proceduresWithCosts = await Promise.all(
      procedures.map(async (procedure) => {
        try {
          // Get cost information
          const { data: costs, error: costsError } = await supabase
            .from('procedure_costs')
            .select('*, hospitals(*)')
            .eq('procedure_id', procedure.id)
            .limit(1);
          
          if (costsError) {
            console.error('Error fetching costs:', costsError);
            return {
              ...procedure,
              costRange: { min: 0, max: 0 },
              deductibleAmount: 0,
              alternatives: []
            };
          }
          
          const cost = costs && costs.length > 0 ? costs[0] : null;
          
          // Get alternative procedures
          const { data: alternatives, error: alternativesError } = await supabase
            .from('procedures')
            .select('name')
            .neq('id', procedure.id)
            .limit(3);
          
          if (alternativesError) {
            console.error('Error fetching alternatives:', alternativesError);
            return {
              ...procedure,
              costRange: cost ? { min: cost.min_cost, max: cost.max_cost } : { min: 0, max: 0 },
              deductibleAmount: cost ? cost.out_of_pocket_cost : 0,
              alternatives: []
            };
          }
          
          return {
            id: procedure.id.toString(),
            name: procedure.name,
            description: procedure.description,
            costRange: cost ? { min: cost.min_cost, max: cost.max_cost } : { min: 0, max: 0 },
            deductibleAmount: cost ? cost.out_of_pocket_cost : 0,
            alternatives: alternatives ? alternatives.map(a => a.name) : [],
            hospital: cost && cost.hospitals ? cost.hospitals.name : null
          };
        } catch (error) {
          console.error('Error processing procedure:', error);
          return {
            id: procedure.id.toString(),
            name: procedure.name,
            description: procedure.description,
            costRange: { min: 0, max: 0 },
            deductibleAmount: 0,
            alternatives: []
          };
        }
      })
    );
    
    // Step 5: Generate a reason for each procedure suggestion
    const suggestionsWithReasons = proceduresWithCosts.map(procedure => {
      // Generate a reason based on the symptoms and procedure description
      let reason = '';
      
      if (symptoms.toLowerCase().includes('pain')) {
        if (procedure.name.toLowerCase().includes('x-ray') || procedure.name.toLowerCase().includes('mri')) {
          reason = 'Imaging tests can help identify the source of your pain and determine the best treatment approach.';
        } else if (procedure.name.toLowerCase().includes('consultation')) {
          reason = 'A specialist consultation can provide a professional assessment of your pain and recommend appropriate treatments.';
        } else if (procedure.name.toLowerCase().includes('therapy')) {
          reason = 'Physical therapy can help manage pain and improve mobility through targeted exercises and techniques.';
        }
      } else if (symptoms.toLowerCase().includes('knee')) {
        if (procedure.name.toLowerCase().includes('arthroscopy')) {
          reason = 'Knee arthroscopy is a minimally invasive procedure that can diagnose and treat various knee conditions.';
        } else if (procedure.name.toLowerCase().includes('replacement')) {
          reason = 'Knee replacement surgery may be recommended for severe knee pain that doesn\'t respond to other treatments.';
        }
      } else if (symptoms.toLowerCase().includes('fever')) {
        if (procedure.name.toLowerCase().includes('blood')) {
          reason = 'Blood tests can help identify the cause of your fever by checking for infections or other conditions.';
        }
      } else {
        // Default reason if no specific match
        reason = `This procedure may be relevant based on your symptoms. A healthcare provider can determine if it's appropriate for your specific situation.`;
      }
      
      return {
        ...procedure,
        reason
      };
    });
    
    return NextResponse.json({ 
      suggestions: suggestionsWithReasons,
      symptoms
    });
  } catch (error) {
    console.error('Error in chatbot procedures API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms and suggest procedures' },
      { status: 500 }
    );
  }
} 