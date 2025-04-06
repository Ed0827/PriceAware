import { searchSimilarSymptoms } from '../lib/ml/vector-search';
import { supabase } from '../lib/supabase-client';

async function testSymptomSearch() {
  try {
    // Test cases with different symptoms
    const testSymptoms = [
      'I have chest pain and difficulty breathing',
      'I have joint pain and stiffness in my knee',
      'I feel tired all the time and weak, and I bruise easily',
    ];

    for (const symptoms of testSymptoms) {
      console.log('\n=== Testing Symptom Search ===');
      console.log('Patient symptoms:', symptoms);
      console.log('---');
      
      // Search for similar symptoms
      const results = await searchSimilarSymptoms(symptoms);
      
      if (results.length === 0) {
        console.log('No matching procedures found');
        continue;
      }

      // Display results
      for (const result of results) {
        // Only show results with a reasonable match score
        if (result.score < 0.1) continue;

        // Get the procedure costs
        const { data: costs } = await supabase
          .from('procedure_costs')
          .select('min_cost, max_cost')
          .eq('procedure_id', result.id)
          .single();

        console.log(`\nRecommended Procedure (${(result.score * 100).toFixed(1)}% match):`);
        console.log(`${result.metadata.name} (${result.metadata.category})`);
        if (costs) {
          console.log(`Estimated cost: $${costs.min_cost} - $${costs.max_cost}`);
        }
        console.log('Why this procedure:');
        console.log(result.metadata.description);
      }
      console.log('\n=====================================');
    }
  } catch (error) {
    console.error('Error testing symptom search:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSymptomSearch()
    .then(() => {
      console.log('\nTest completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}