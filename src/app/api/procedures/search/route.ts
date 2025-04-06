import { QdrantClient } from '@qdrant/js-client-rest';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ProcedurePayload {
  name: string;
  description?: string;
}

function isProcedurePayload(payload: unknown): payload is ProcedurePayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'name' in payload &&
    typeof (payload as ProcedurePayload).name === 'string'
  );
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the query using OpenAI
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Search for similar procedures in Qdrant
    const searchResult = await qdrant.search('procedures', {
      vector: embedding.data[0].embedding,
      limit: 5,
    });

    // Get procedure details from the search results
    const suggestions = await Promise.all(
      searchResult.map(async (result) => {
        if (!result.payload || !isProcedurePayload(result.payload)) {
          throw new Error('Invalid payload in search result');
        }

        // Use OpenAI to generate a description for the procedure
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a medical procedure expert. Provide a brief, informative description of the procedure.',
            },
            {
              role: 'user',
              content: `Describe the medical procedure: ${result.payload.name}`,
            },
          ],
          max_tokens: 100,
        });

        return {
          name: result.payload.name,
          description: completion.choices[0].message.content,
          relevance: result.score,
        };
      })
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in procedure search:', error);
    return NextResponse.json(
      { error: 'Failed to search procedures' },
      { status: 500 }
    );
  }
} 