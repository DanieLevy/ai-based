'use client';

import { useState } from 'react';
import ModelSelector from './ModelSelector';

// Define test types
const TEST_TYPES = [
  { id: 'chat', name: 'Chat Completion' },
  { id: 'completion', name: 'Text Completion' }
];

// Define preset prompts for testing
const PRESET_PROMPTS = [
  { 
    id: 'basic', 
    name: 'Basic Q&A', 
    prompt: 'What is the capital of France?',
    system: 'You are a helpful assistant who provides accurate and concise information.'
  },
  { 
    id: 'creative', 
    name: 'Creative Writing', 
    prompt: 'Write a short poem about artificial intelligence.',
    system: 'You are a creative assistant who specializes in writing compelling short content.'
  },
  { 
    id: 'code', 
    name: 'Code Generation', 
    prompt: 'Write a JavaScript function that calculates the Fibonacci sequence up to n terms.',
    system: 'You are a coding assistant. Provide clean, efficient code with brief explanations.'
  },
  { 
    id: 'reasoning', 
    name: 'Complex Reasoning', 
    prompt: 'I have 5 apples. I give 2 apples to my friend. I buy 3 more apples. Then I eat 1 apple. How many apples do I have left?',
    system: 'You are a logical assistant. Break down problems step by step and show your reasoning.'
  }
];

export default function ApiTester() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testType, setTestType] = useState<string>('chat');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful assistant.');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTime, setLoadingTime] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Load preset prompt
  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_PROMPTS.find(p => p.id === presetId);
    if (preset) {
      setUserPrompt(preset.prompt);
      setSystemPrompt(preset.system);
      setSelectedPreset(presetId);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }
    
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setError(null);
    setResponse(null);
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Configure the request based on test type
      let endpoint = '';
      let requestBody = {};
      
      if (testType === 'chat') {
        endpoint = '/api/ai/chat';
        requestBody = {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: selectedModel,
          temperature,
          max_tokens: maxTokens || undefined
        };
      } else {
        endpoint = '/api/ai/completion';
        requestBody = {
          prompt: userPrompt,
          model: selectedModel,
          temperature,
          max_tokens: maxTokens || undefined
        };
      }
      
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'An error occurred');
      }
      
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API request failed:', err);
    } finally {
      setLoadingTime(Date.now() - startTime);
      setLoading(false);
    }
  };

  // Get response text from API response
  const getResponseText = () => {
    if (!response) return '';
    
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message?.content || '';
    }
    
    return JSON.stringify(response, null, 2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Model Testing Interface</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ModelSelector 
            onModelSelect={(modelId) => setSelectedModel(modelId)}
            selectedModel={selectedModel}
          />

          <div className="mt-6 p-4 border border-gray-300 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Test Type</label>
              <div className="flex space-x-2">
                {TEST_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`px-3 py-1 text-sm rounded-md ${
                      testType === type.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setTestType(type.id)}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Preset Prompts</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => handlePresetSelect(e.target.value)}
                value={selectedPreset || ''}
              >
                <option value="">-- Select a preset --</option>
                {PRESET_PROMPTS.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Deterministic</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Max Tokens {maxTokens ? `(${maxTokens})` : '(unlimited)'}
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={maxTokens || 1000}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setMaxTokens(value === 1000 && !maxTokens ? undefined : value);
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {testType === 'chat' && (
              <div>
                <label className="block text-sm font-medium mb-1">System Prompt</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {testType === 'chat' ? 'User Message' : 'Prompt'}
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={5}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedModel}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Processing...' : 'Send Request'}
              </button>
            </div>
          </form>
          
          {loading && (
            <div className="mt-6 p-4 border border-gray-300 rounded-md">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          {response && !loading && (
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 p-4 mb-4 rounded-md">
                <h3 className="font-bold mb-1 text-green-800">Response</h3>
                <p className="mb-2 text-sm text-gray-500">
                  Completed in {response._metadata?.responseTime || loadingTime}ms
                  {response._metadata?.estimatedCost && (
                    <> • Est. cost: ${response._metadata.estimatedCost.toFixed(6)}</>
                  )}
                </p>
                <div className="bg-white border border-gray-200 p-3 rounded whitespace-pre-wrap">
                  {getResponseText()}
                </div>
              </div>
              
              <details className="border border-gray-300 rounded-md">
                <summary className="p-3 font-medium cursor-pointer">View Full Response</summary>
                <pre className="p-3 bg-gray-50 text-xs overflow-auto max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 