'use client';

import { Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProcedureSuggestions from "../components/ProcedureSuggestions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SearchResult {
  id: string;
  score: number;
  procedure: {
    id: string;
    name: string;
    description: string;
    category: string;
  } | null;
}

interface Procedure {
  id: string;
  name: string;
  description: string;
  category: string;
  matchScore: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your healthcare assistant. How can I help you today? You can describe your symptoms, and I'll help you understand potential procedures and find hospitals that accept your insurance."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Check if the message is a greeting or non-symptom input
    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy)$/i.test(userMessage);
    
    if (isGreeting) {
      // For greetings, just respond without showing procedure suggestions
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Hello! I'm here to help you find information about medical procedures. Please describe your symptoms or what you're looking for, and I'll help you find relevant procedures and cost information." 
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Get procedure suggestions based on symptoms
      const symptomsResponse = await fetch("/api/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: userMessage,
        }),
      });

      if (symptomsResponse.ok) {
        const symptomsData = await symptomsResponse.json();
        
        // Only show procedure suggestions if we found procedures
        if (symptomsData.results && symptomsData.results.length > 0) {
          // Extract procedures from results
          const procedures = symptomsData.results
            .filter((result: SearchResult) => result.procedure)
            .map((result: SearchResult) => ({
              id: result.id,
              name: result.procedure!.name,
              description: result.procedure!.description,
              category: result.procedure!.category,
              matchScore: result.score
            }));
          
          // Store the procedure suggestions in localStorage for the results page
          localStorage.setItem("procedureSuggestions", JSON.stringify(procedures));
          localStorage.setItem("symptoms", userMessage);

          // Add AI response to chat with personalized explanation
          setMessages((prev) => [
            ...prev,
            { 
              role: "assistant", 
              content: procedures.length > 0 
                ? `Based on your symptoms, I've found some relevant procedures. The top match is ${procedures[0].name} (${(procedures[0].matchScore * 100).toFixed(1)}% match). You can view detailed information about these procedures below or click the button to find hospitals that accept your insurance.`
                : "Based on your symptoms, I've found some relevant procedures. You can view detailed information about these procedures below or click the button to find hospitals that accept your insurance."
            }
          ]);
          
          // Show procedure suggestions
          setShowSuggestions(true);
        } else {
          // If no procedures found, provide a helpful response
          setMessages((prev) => [
            ...prev,
            { 
              role: "assistant", 
              content: "I couldn't find specific procedures related to your symptoms. Could you please provide more details about your symptoms or try searching for a specific procedure? For example, you could say 'I have a fever and cough' or search for 'colonoscopy'." 
            }
          ]);
          setShowSuggestions(false);
        }
      } else {
        throw new Error("Failed to get procedure suggestions");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." },
      ]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewResults = () => {
    // Navigate to the results page
    router.push("/results");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      <header className="p-4 border-b border-white/10 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          PriceAware+
        </Link>
        <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
          About
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-white/5 text-gray-200">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        
        {/* Procedure Suggestions - only show when we have suggestions */}
        {showSuggestions && (
          <div className="mt-6 bg-white/5 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Procedure Suggestions</h2>
            <ProcedureSuggestions />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleViewResults}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View Detailed Results
          </button>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your symptoms or search for a procedure..."
            className="flex-1 p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="p-3 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 