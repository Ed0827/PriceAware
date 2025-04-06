'use client'

import React, { useEffect, useRef, useState } from 'react'
import ProcedureSuggestions from './ProcedureSuggestions'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ProcedureSuggestion {
  id: string
  name: string
  description: string
  costRange: {
    min: number
    max: number
  }
  deductibleAmount: number
  alternatives: string[]
  hospital: string | null
  reason: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<ProcedureSuggestion[]>([])
  const [currentSymptoms, setCurrentSymptoms] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      // First, get procedure suggestions
      const suggestionsResponse = await fetch('/api/chatbot/procedures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: userMessage }),
      })

      if (!suggestionsResponse.ok) {
        throw new Error('Failed to get procedure suggestions')
      }

      const suggestionsData = await suggestionsResponse.json()
      setSuggestions(suggestionsData.suggestions)
      setCurrentSymptoms(userMessage)

      // Then, get chat response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      if (!chatResponse.ok) {
        throw new Error('Failed to get chat response')
      }

      const chatData = await chatResponse.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: chatData.response },
      ])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="p-4 border-t">
          <ProcedureSuggestions
            suggestions={suggestions}
            symptoms={currentSymptoms}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
} 