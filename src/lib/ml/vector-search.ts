import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../openai-client';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});
let pineconeIndex: any = null;

// Define the search result interface
interface SearchResult {
  id: string;
  score: number;
  metadata: {
    name: string;
    category: string;
    cost: number;
    description: string;
  };
}

/**
 * Initialize the Pinecone client and get the index
 */
async function initPinecone() {
  if (!pineconeIndex) {
    const indexName = process.env.PINECONE_INDEX_NAME || 'symptoms';
    pineconeIndex = pinecone.index(indexName);
  }
  return pineconeIndex;
}

/**
 * Search for similar symptoms in the vector database
 * @param symptomText The symptom text to search for
 * @returns Array of search results with procedure details
 */
export async function searchSimilarSymptoms(symptomText: string): Promise<SearchResult[]> {
  try {
    // Check if Pinecone API key is configured
    if (!process.env.PINECONE_API_KEY) {
      console.warn('Pinecone API key not configured, returning empty results');
      return [];
    }

    // Initialize Pinecone client
    const index = await initPinecone();

    // Generate embedding for the symptom text
    const embedding = await generateEmbedding(symptomText);

    // Search for similar symptoms in the vector database
    const searchResults = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    // Map the search results to our expected format
    return searchResults.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error('Error searching similar symptoms:', error);
    return [];
  }
}

/**
 * Set up the vector database with the symptoms collection
 */
export async function setupVectorDatabase() {
  try {
    // Check if Pinecone API key is configured
    if (!process.env.PINECONE_API_KEY) {
      console.warn('Pinecone API key not configured, skipping vector database setup');
      return;
    }

    // Check if the index exists
    const indexName = process.env.PINECONE_INDEX_NAME || 'symptoms';
    const indexes = await pinecone.listIndexes();
    
    // Print all available indexes
    console.log('Available Pinecone indexes:');
    if (indexes.indexes && indexes.indexes.length > 0) {
      indexes.indexes.forEach((index: any) => {
        console.log(`- ${index.name}`);
      });
    } else {
      console.log('No indexes found in your Pinecone account');
    }
    
    // Check if the index exists in the list
    const indexExists = indexes.indexes?.some((index: any) => index.name === indexName) || false;
    
    if (!indexExists) {
      // Create the index if it doesn't exist
      // Note: You'll need to create the index manually in the Pinecone console
      // with the following configuration:
      // - Dimension: 1536 (OpenAI embedding size)
      // - Metric: cosine
      console.log(`Please create the index '${indexName}' in the Pinecone console with dimension 1536 and metric 'cosine'`);
      return;
    }

    console.log(`Index '${indexName}' exists in Pinecone`);
  } catch (error) {
    console.error('Error setting up vector database:', error);
  }
} 