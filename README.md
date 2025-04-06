# PriceAware+

PriceAware+ is a medical procedure suggestion application that helps patients make informed decisions about their healthcare by providing relevant procedure suggestions based on their symptoms, along with cost information and alternatives.

## Features

- **Symptom Analysis**: The application analyzes user-reported symptoms using a combination of vector search (Qdrant) and text search (Supabase) to find relevant medical procedures.
- **Procedure Suggestions**: Based on the symptom analysis, the application suggests appropriate medical procedures with detailed information.
- **Cost Information**: For each suggested procedure, the application provides cost ranges, deductible amounts, and insurance coverage information.
- **Alternative Options**: The application suggests alternative procedures that might be relevant to the user's symptoms.
- **Hospital Information**: The application provides information about hospitals that offer the suggested procedures.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Vector Search**: Qdrant
- **AI/ML**: OpenAI API for embeddings and chat responses

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Qdrant account
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/priceaware-plus.git
   cd priceaware-plus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the vector database:
   ```bash
   npm run populate-vector-db
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Symptom Analysis with OpenAI and Qdrant

When a user enters their symptoms (e.g., "I have fever"), the application:

1. **Generates Embeddings**: Uses OpenAI's embedding API to convert the symptoms into a vector representation.
2. **Vector Search**: Queries the Qdrant vector database to find similar symptoms and associated procedures.
3. **Fallback Mechanism**: If vector search doesn't return results, falls back to text search in Supabase.
4. **Personalized Response**: Uses OpenAI to generate a personalized explanation of why the suggested procedures might be relevant.

### Vector Database Setup

The application uses Qdrant as a vector database to store embeddings of procedure descriptions. This enables semantic search, which is more powerful than traditional keyword search.

To populate the vector database with procedure data:

```bash
npm run populate-vector-db
```

This script:
1. Fetches procedures from Supabase
2. Generates embeddings for each procedure description using OpenAI
3. Stores the embeddings in Qdrant along with procedure IDs

## Project Structure

- `src/app`: Next.js app directory
  - `api`: API routes
  - `components`: React components
  - `lib`: Utility functions and clients
  - `scripts`: Scripts for database population and maintenance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
