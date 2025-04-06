# PriceAware+

PriceAware+ is a medical procedure suggestion application that helps patients make informed decisions about their healthcare by providing relevant procedure suggestions based on their symptoms, along with cost information and alternatives.

## Features

- **Symptom Analysis**: The application analyzes user-reported symptoms using a combination of vector search (Pinecone) and text search (Supabase) to find relevant medical procedures.
- **Procedure Suggestions**: Based on the symptom analysis, the application suggests appropriate medical procedures with detailed information.
- **Cost Information**: For each suggested procedure, the application provides cost ranges, deductible amounts, and insurance coverage information.
- **Alternative Options**: The application suggests alternative procedures that might be relevant to the user's symptoms.
- **Hospital Information**: The application provides information about hospitals that offer the suggested procedures.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Vector Search**: Pinecone for semantic search
- **AI/ML**: OpenAI API for embeddings and chat responses
- **Storage**: Cloudflare R2 for Parquet file storage

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Pinecone account
- OpenAI API key
- Cloudflare R2 account (for Parquet file storage)
- Google Maps API key (optional)

### Environment Variables

1. Copy the `.env.example` file to create your own `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual API keys and credentials in the `.env.local` file:
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here

   # Pinecone
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=your_pinecone_index_name_here
   PINECONE_SERVER_URL=your_pinecone_server_url_here

   # Cloudflare R2 credentials (for Parquet file storage)
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
   CLOUDFLARE_ACCESS_KEY_ID=your_cloudflare_access_key_id_here
   CLOUDFLARE_SECRET_ACCESS_KEY=your_cloudflare_secret_access_key_here
   CLOUDFLARE_BUCKET_NAME=your_bucket_name_here

   # Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Google Maps (optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id_here
   ```

3. **Important**: Never commit your `.env.local` file to version control. It's already in the `.gitignore` file.

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

### Symptom Analysis with OpenAI and Pinecone

When a user enters their symptoms (e.g., "I have fever"), the application:

1. **Generates Embeddings**: Uses OpenAI's embedding API to convert the symptoms into a vector representation.
2. **Vector Search**: Queries the Pinecone vector database to find similar symptoms and associated procedures.
3. **Fallback Mechanism**: If vector search doesn't return results, falls back to text search in Supabase.
4. **Personalized Response**: Uses OpenAI to generate a personalized explanation of why the suggested procedures might be relevant.

### Vector Database Setup

The application uses Pinecone as a vector database to store embeddings of procedure descriptions. This enables semantic search, which is more powerful than traditional keyword search.

To populate the vector database with procedure data:

```bash
npm run populate-vector-db
```

This script:
1. Fetches procedures from Supabase
2. Generates embeddings for each procedure description using OpenAI
3. Stores the embeddings in Pinecone along with procedure IDs

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
