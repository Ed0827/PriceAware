import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate embeddings for a text
export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Function to generate a chat response
export async function generateChatResponse(messages: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are PriceAware+, an AI assistant that helps users understand their healthcare costs and promotes transparency.
          You can analyze symptoms and suggest relevant medical procedures.
          You can also help users find hospitals that accept their insurance.
          Always be empathetic, informative, and focused on helping users make informed healthcare decisions.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

// Function to analyze symptoms and suggest procedures
export async function analyzeSymptoms(symptoms: string) {
  try {
    // Generate embedding for symptoms
    const symptomEmbedding = await generateEmbedding(symptoms);
    
    // Get procedure suggestions based on symptom embedding
    // This would typically call the Qdrant client to search for similar procedures
    // For now, we'll return a mock response
    
    const mockResponse = {
      suggestedProcedures: [
        { id: 1, name: 'Blood Test', description: 'A blood test to check for various conditions', cost: 150 },
        { id: 2, name: 'X-Ray', description: 'An X-ray to check for bone fractures', cost: 250 },
      ],
      explanation: `Based on your symptoms, I recommend getting a blood test and an X-ray. 
      These procedures can help diagnose the underlying cause of your symptoms. 
      The blood test will check for various conditions, while the X-ray will help identify any bone fractures or abnormalities.`,
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
} 