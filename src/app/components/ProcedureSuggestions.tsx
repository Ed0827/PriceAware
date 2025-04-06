'use client';

import { ArrowRight, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcedureSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  matchScore: number;
}

export default function ProcedureSuggestions() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProcedureSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ProcedureSuggestion | null>(null);

  // Load suggestions from localStorage on component mount
  useEffect(() => {
    const storedSuggestions = localStorage.getItem('procedureSuggestions');
    if (storedSuggestions) {
      try {
        setSuggestions(JSON.parse(storedSuggestions));
      } catch (error) {
        console.error('Error parsing stored suggestions:', error);
      }
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      // Extract procedures from results
      const procedures = data.results
        .filter((result: any) => result.procedure)
        .map((result: any) => ({
          id: result.id,
          name: result.procedure.name,
          description: result.procedure.description,
          category: result.procedure.category,
          matchScore: result.score
        }));
        
      setSuggestions(procedures);
      
      // Store in localStorage for persistence
      localStorage.setItem('procedureSuggestions', JSON.stringify(procedures));
      localStorage.setItem('symptoms', query);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: ProcedureSuggestion) => {
    setSelectedSuggestion(suggestion);
    // You can add additional actions here, like navigating to the procedure details
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Describe your symptoms or search for a procedure..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedSuggestion?.name === suggestion.name
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } border`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">{suggestion.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{suggestion.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Category: {suggestion.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {Math.round(suggestion.matchScore * 100)}% match
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No procedure suggestions found. Try describing your symptoms in more detail.</p>
        </div>
      )}

      {/* Selected Suggestion Details */}
      {selectedSuggestion && (
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">{selectedSuggestion.name}</h2>
          <p className="text-gray-300 mb-4">{selectedSuggestion.description}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = `/compare?procedure=${encodeURIComponent(selectedSuggestion.name)}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Compare Costs
            </button>
            <button
              onClick={() => window.location.href = `/chat?procedure=${encodeURIComponent(selectedSuggestion.name)}`}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 