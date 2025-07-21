"use client";

import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '@/app/lib/ai/models';
import { MultiStepLoader } from '../ui/multi-step-loader';
import { IconSquareRoundedX } from '@tabler/icons-react';

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
  keywords: string[];
  hasResults: boolean;
  relevanceScore?: number;
  metadata?: {
    processingTime: number;
    sourceCount: number;
    model: string;
    keywords: string[];
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    cost?: number;
  };
  error?: string;
}

// Define loading states for the search process
const searchLoadingStates = [
  { text: "Analyzing your question..." },
  { text: "Generating optimal search keywords..." },
  { text: "Searching knowledge base..." },
  { text: "Finding relevant documents..." },
  { text: "Processing information..." },
  { text: "Summarizing findings..." },
  { text: "Crafting your response..." },
  { text: "Almost there..." }
];

export default function EnhancedConfluenceSearchWithLoader() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStage, setSearchStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState(process.env.MODEL || 'us.anthropic.claude-3-5-sonnet-20240620-v1:0');
  const [maxResults, setMaxResults] = useState(5);
  const [showAllSources, setShowAllSources] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSearchStage('Generating search keywords...');

    try {
      setSearchStage('Searching Confluence with AI-optimized keywords...');
      
      const res = await fetch('/api/ai/enhanced-search-assistant', {
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
      setSearchStage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setSearchStage(null);
    } finally {
      // Keep the loader visible for a little longer for a better UX
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const toggleShowKeywords = () => {
    setShowKeywords(!showKeywords);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Enhanced Confluence Knowledge Assistant</h1>
        
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Multi-Step Loader */}
        <MultiStepLoader loadingStates={searchLoadingStates} loading={loading} duration={800} />

        {loading && (
          <button
            className="fixed top-4 right-4 text-black dark:text-white z-[120]"
            onClick={() => setLoading(false)}
          >
            <IconSquareRoundedX className="h-10 w-10" />
          </button>
        )}
        
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {response && !loading && (
          <div className="mt-6 space-y-6">
            {response.metadata?.keywords && response.metadata.keywords.length > 0 && (
              <div className="flex items-center">
                <button
                  onClick={toggleShowKeywords}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 transition-transform ${showKeywords ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showKeywords ? 'Hide AI-generated search keywords' : 'Show AI-generated search keywords'}
                </button>
              </div>
            )}
            
            {showKeywords && response.keywords && (
              <div className="bg-blue-50 border border-blue-100 rounded p-3">
                <p className="text-sm text-gray-700 mb-1">AI-optimized search keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {response.keywords.map((keyword, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                {response.relevanceScore !== undefined && (
                  <div>Relevance: {Math.round(response.relevanceScore * 100)}%</div>
                )}
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
                  No matching documents were found in Confluence using the generated keywords.
                  {response.keywords && response.keywords.length > 0 && (
                    <>
                      <br />
                      <span className="font-medium">Search terms used:</span> {response.keywords.join(', ')}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About Enhanced Knowledge Search</h2>
        <div className="prose max-w-none">
          <p>
            This tool uses AI to intelligently search your company's Confluence knowledge base. It goes beyond simple keyword matching by:
          </p>
          
          <h3 className="text-lg font-medium mt-4">How it works:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>AI Keyword Generation</strong> - Your question is analyzed by AI to extract the most relevant search terms</li>
            <li><strong>Semantic Search</strong> - These optimized keywords are used to search Confluence for relevant documents</li>
            <li><strong>Multiple Document Integration</strong> - All retrieved documents are combined as context for the AI</li>
            <li><strong>Response Generation</strong> - A comprehensive answer is crafted based solely on the retrieved documents</li>
            <li><strong>Relevance Verification</strong> - The system checks if the response actually addresses your question</li>
          </ol>
          
          <h3 className="text-lg font-medium mt-4">Benefits over standard search:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Finds information even when your exact phrasing isn't in the documentation</li>
            <li>Understands technical terminology and acronyms</li>
            <li>Combines information from multiple sources into a single, coherent answer</li>
            <li>Shows you the source documents so you can verify the information</li>
            <li>Provides transparency about how the answer was generated</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 