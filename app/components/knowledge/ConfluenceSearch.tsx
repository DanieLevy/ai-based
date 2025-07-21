"use client";

import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '@/app/lib/ai/models';

interface SearchResult {
  title: string;
  url: string;
  space: string;
  excerpt: string;
}

interface SearchResponse {
  success: boolean;
  response: string;
  searchResults: SearchResult[];
  query: string;
  hasResults: boolean;
  metadata?: {
    processingTime: number;
    sourceCount: number;
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    cost?: number;
  };
  error?: string;
}

export default function ConfluenceSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState(process.env.MODEL || 'us.anthropic.claude-3-5-sonnet-20240620-v1:0');
  const [maxResults, setMaxResults] = useState(3);
  const [showAllSources, setShowAllSources] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          model: selectedModel,
          maxResults
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to search Confluence');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Confluence Knowledge Assistant</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                Ask a question about your company knowledge base:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base border p-2"
                  placeholder="e.g., What is the process for requesting time off?"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={`px-4 py-2 rounded-md font-medium text-white ${
                    loading || !query.trim()
                      ? 'bg-blue-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base border p-2"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.provider}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Results to Include: {maxResults}
                </label>
                <input
                  type="range"
                  id="maxResults"
                  min="1"
                  max="10"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </form>
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Response:</h2>
              <div className="prose max-w-none">
                {response.response.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>

            {response.metadata && (
              <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-2">
                <div>Processing time: {(response.metadata.processingTime / 1000).toFixed(2)}s</div>
                <div>Sources: {response.metadata.sourceCount}</div>
                <div>Model: {response.metadata.model.split('-')[0]}</div>
                {response.metadata.usage && (
                  <>
                    <div>Tokens: {response.metadata.usage.total_tokens} total</div>
                    <div>Cost: ${response.metadata.cost?.toFixed(6) || 'N/A'}</div>
                  </>
                )}
              </div>
            )}

            {response.searchResults && response.searchResults.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Sources:</h2>
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showAllSources ? 'Show Less' : 'Show All'}
                  </button>
                </div>
                <div className="space-y-4">
                  {response.searchResults
                    .slice(0, showAllSources ? undefined : 3)
                    .map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">
                            Source {index + 1}: {result.title}
                          </h3>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {result.space}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{result.excerpt}</p>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View in Confluence
                        </a>
                      </div>
                    ))}
                  
                  {!showAllSources && response.searchResults.length > 3 && (
                    <p className="text-center text-sm text-gray-500">
                      {response.searchResults.length - 3} more sources not shown
                    </p>
                  )}
                </div>
              </div>
            )}

            {response.hasResults === false && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <p className="font-medium">No relevant information found</p>
                <p className="text-sm">
                  No matching documents were found in Confluence for your query.
                  Try refining your search terms or checking your spelling.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About This Feature</h2>
        <div className="prose max-w-none">
          <p>
            This tool allows you to ask questions about information stored in your company's
            Confluence knowledge base. The AI will search for relevant content and generate
            a response based on what it finds.
          </p>
          
          <h3 className="text-lg font-medium mt-4">How it works:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Enter your question in natural language</li>
            <li>The system searches Confluence for relevant documents</li>
            <li>The AI reads the documents and crafts a response specifically to your question</li>
            <li>You can view the source documents to verify the information</li>
          </ol>
          
          <h3 className="text-lg font-medium mt-4">Best practices:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ask specific questions rather than broad ones</li>
            <li>Include relevant keywords that might be in the documentation</li>
            <li>If you don't get helpful results, try rephrasing your question</li>
            <li>Always verify information by checking the source documents</li>
            <li>Adjust the "Max Results" slider to include more context if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 