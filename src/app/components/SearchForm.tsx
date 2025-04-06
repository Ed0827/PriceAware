'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchForm() {
    const [symptoms, setSymptoms] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // In production, we'd make an API call here to process symptoms
            // For now, we'll just redirect to the results page with the symptoms as a query parameter
            router.push(`/results?symptoms=${encodeURIComponent(symptoms)}`)
        } catch (error) {
            console.error('Error processing symptoms:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
                  placeholder="Describe your symptoms in detail (e.g., 'I have been experiencing severe pain in my right knee when walking or clibing stairs for the past two weeks')"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                />
            </div>
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                loading || !symptoms.trim() ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
              }`}
             >
                {loading ? 'Processing...' : 'Find Procedures'}
                </button>
            </form>
    )
}