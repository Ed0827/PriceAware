import { Pinecone } from '@pinecone-database/pinecone';
import { setupVectorDatabase } from '../lib/ml/vector-search';
import { generateEmbedding } from '../lib/openai-client';
import { supabase } from '../lib/supabase-client';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Sample procedures to add if none exist
const sampleProcedures = [
  {
    name: 'Blood Test',
    description: 'Common symptoms requiring blood tests: fatigue, weakness, unexplained weight loss, fever, bruising easily, inflammation. Blood tests help diagnose anemia, infections, blood clotting issues, diabetes, and other conditions affecting blood cells and chemistry.',
    category: 'Laboratory',
  },
  {
    name: 'Chest X-Ray',
    description: 'Common symptoms requiring chest X-rays: chest pain, difficulty breathing, persistent cough, shortness of breath, chest injury. X-rays help diagnose pneumonia, lung infections, broken ribs, heart problems, and other chest conditions.',
    category: 'Imaging',
  },
  {
    name: 'COVID-19 Test',
    description: 'A test to detect the presence of the SARS-CoV-2 virus, which causes COVID-19. Recommended for patients with fever, cough, or other respiratory symptoms.',
    category: 'Laboratory',
  },
  {
    name: 'Flu Test',
    description: 'A test to detect the presence of the influenza virus. Recommended for patients with fever, body aches, and respiratory symptoms during flu season.',
    category: 'Laboratory',
  },
  {
    name: 'Strep Throat Test',
    description: 'A test to detect the presence of streptococcus bacteria, which can cause strep throat. Recommended for patients with sore throat, fever, and difficulty swallowing.',
    category: 'Laboratory',
  },
  {
    name: 'Urinalysis',
    description: 'A test of urine to check for various conditions including urinary tract infections, kidney problems, and diabetes. Common for patients with urinary symptoms or as part of a general checkup.',
    category: 'Laboratory',
  },
  {
    name: 'Colonoscopy',
    description: 'A procedure to examine the inside of the colon and rectum using a flexible tube with a camera. Recommended for screening for colorectal cancer and diagnosing various gastrointestinal conditions.',
    category: 'Endoscopy',
  },
  {
    name: 'Mammogram',
    description: 'An X-ray of the breast used to screen for breast cancer. Recommended for women over 40 as part of routine screening.',
    category: 'Imaging',
  },
  {
    name: 'CT Scan',
    description: 'A computed tomography scan that uses X-rays to create detailed cross-sectional images of the body. Used to diagnose various conditions affecting bones, organs, and blood vessels.',
    category: 'Imaging',
  },
  {
    name: 'Physical Therapy',
    description: 'Common symptoms requiring physical therapy: joint pain and stiffness, muscle weakness, limited range of motion, back pain, difficulty walking. Physical therapy helps improve mobility, strength, and function while reducing pain.',
    category: 'Therapy',
  },
  {
    name: 'Orthopedic Consultation',
    description: 'Common symptoms requiring orthopedic consultation: joint pain, bone pain, limited mobility, sports injuries, arthritis symptoms. Orthopedic specialists diagnose and treat conditions affecting bones, joints, and muscles.',
    category: 'Consultation',
  }
];

/**
 * Populate the vector database with symptom data from Supabase
 */
async function populateVectorDatabase() {
  try {
    // Set up the vector database
    await setupVectorDatabase();

    // Delete existing procedure costs
    const { error: deleteCostsError } = await supabase
      .from('procedure_costs')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteCostsError) {
      throw deleteCostsError;
    }
    console.log('Deleted existing procedure costs');

    // Delete existing procedures
    const { error: deleteError } = await supabase
      .from('procedures')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError) {
      throw deleteError;
    }
    console.log('Deleted existing procedures');

    // Insert sample procedures
    const { data: procedures, error: insertError } = await supabase
      .from('procedures')
      .insert(sampleProcedures)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`Added ${procedures?.length || 0} procedures to the database`);

    // Get the Pinecone index
    const indexName = process.env.PINECONE_INDEX_NAME || 'symptoms';
    const index = pinecone.index(indexName);

    // Delete all existing vectors
    await index.deleteAll();
    console.log('Deleted existing vectors from Pinecone');

    // Process each procedure
    for (const procedure of (procedures || [])) {
      try {
        console.log(`Processing procedure: ${procedure.name} (ID: ${procedure.id})`);
        
        // Generate embedding for the procedure description
        const embedding = await generateEmbedding(procedure.description);

        // Create a point in the vector database
        await index.upsert([{
          id: procedure.id.toString(),
          values: embedding,
          metadata: {
            name: procedure.name,
            category: procedure.category,
            description: procedure.description
          },
        }]);

        console.log(`Successfully processed procedure: ${procedure.name}`);
      } catch (error) {
        console.error(`Error processing procedure ${procedure.name}:`, error);
      }
    }

    console.log('Vector database population completed');
  } catch (error) {
    console.error('Error populating vector database:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  populateVectorDatabase()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { populateVectorDatabase };
