'use client';

import { useState, useRef, ChangeEvent } from 'react';
import ModelSelector from './ModelSelector';

// Define test types
const TEST_TYPES = [
  { id: 'chat', name: 'Chat Completion' },
  { id: 'completion', name: 'Text Completion' },
  { id: 'vision', name: 'Vision (Image)' }
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
  },
  {
    id: 'image_description',
    name: 'Image Description',
    prompt: 'Describe this image in detail.',
    system: 'You are a visual analysis assistant. Provide detailed descriptions of images.'
  },
  {
    id: 'image_analysis',
    name: 'Image Analysis',
    prompt: 'What objects and people can you see in this image? List them with brief descriptions.',
    system: 'You are a visual analysis assistant. Identify and list elements in images.'
  },
  {
    id: 'image_text',
    name: 'Extract Text from Image',
    prompt: 'Extract and transcribe any text visible in this image.',
    system: 'You are a text extraction assistant. Identify and transcribe text from images.'
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Check if the file is not too large (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        setError('Image is too large. Please select an image smaller than 4MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // If not already on vision test type, switch to it
      if (testType !== 'vision') {
        setTestType('vision');
      }
      
      // Clear any previous error
      setError(null);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle test type change
  const handleTestTypeChange = (type: string) => {
    setTestType(type);
    
    // If switching to vision and no image is selected, show a hint
    if (type === 'vision' && !selectedImage) {
      setError('Please select an image for vision analysis');
    } else {
      setError(null);
    }
    
    // If switching away from vision, clear the image
    if (type !== 'vision') {
      removeImage();
    }
    
    // Set appropriate preset prompts based on type
    if (type === 'vision') {
      const imagePreset = PRESET_PROMPTS.find(p => p.id === 'image_description');
      if (imagePreset) {
        setUserPrompt(imagePreset.prompt);
        setSystemPrompt(imagePreset.system);
        setSelectedPreset('image_description');
      }
    } else {
      const basicPreset = PRESET_PROMPTS.find(p => p.id === 'basic');
      if (basicPreset) {
        setUserPrompt(basicPreset.prompt);
        setSystemPrompt(basicPreset.system);
        setSelectedPreset('basic');
      }
    }
  };

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
    
    if (!userPrompt.trim() && testType !== 'vision') {
      setError('Please enter a prompt');
      return;
    }

    if (testType === 'vision' && !selectedImage) {
      setError('Please select an image');
      return;
    }
    
    setError(null);
    setResponse(null);
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Configure the request based on test type
      let endpoint = '';
      let requestBody: any = {};
      
      if (testType === 'vision') {
        endpoint = '/api/ai/vision';
        
        // For vision, we need to use FormData to include the image
        const formData = new FormData();
        formData.append('image', selectedImage!);
        formData.append('prompt', userPrompt);
        formData.append('model', selectedModel);
        formData.append('temperature', temperature.toString());
        
        // Make the API request with FormData
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.error || 'An error occurred');
        }
        
        setResponse(data);
      } else if (testType === 'chat') {
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
        
        // Make the API request with JSON
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
      } else {
        endpoint = '/api/ai/completion';
        requestBody = {
          prompt: userPrompt,
          model: selectedModel,
          temperature,
          max_tokens: maxTokens || undefined
        };
        
        // Make the API request with JSON
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
      }
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

  // Get available presets based on test type
  const getAvailablePresets = () => {
    if (testType === 'vision') {
      return PRESET_PROMPTS.filter(p => ['image_description', 'image_analysis', 'image_text'].includes(p.id));
    } else {
      return PRESET_PROMPTS.filter(p => !['image_description', 'image_analysis', 'image_text'].includes(p.id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Model Testing Interface</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ModelSelector 
            onModelSelect={(modelId) => setSelectedModel(modelId)}
            selectedModel={selectedModel}
            visionOnly={testType === 'vision'}
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
                    onClick={() => handleTestTypeChange(type.id)}
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
                {getAvailablePresets().map(preset => (
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
            {testType === 'vision' && (
              <div className="border border-gray-300 rounded-md p-4">
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Selected" 
                      className="w-full max-h-60 object-contain rounded-md mb-2" 
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      onClick={removeImage}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500">
                      {selectedImage?.name} ({Math.round(selectedImage?.size / 1024)} KB)
                    </p>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Click to upload an image or drag and drop</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
            
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
                {testType === 'chat' 
                  ? 'User Message' 
                  : testType === 'vision' 
                    ? 'Question about the image' 
                    : 'Prompt'}
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={5}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={
                  testType === 'vision' 
                    ? "Enter a question or instruction about the image..." 
                    : "Enter your prompt here..."
                }
                required={testType !== 'vision'}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedModel || (testType === 'vision' && !selectedImage)}
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
                  {testType === 'vision' && response._metadata?.imageSize && (
                    <> • Image size: {Math.round(response._metadata.imageSize / 1024)} KB</>
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