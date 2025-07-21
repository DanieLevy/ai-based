'use client';

import { useState, useEffect } from 'react';
import { AIModel, VISION_CAPABLE_MODELS } from '@/app/lib/ai/models';

interface ModelSelectorProps {
  onModelSelect: (modelId: string) => void;
  selectedModel?: string;
  filterByCapability?: string;
  filterByProvider?: string;
  filterByCostTier?: string;
  visionOnly?: boolean;
  className?: string;
}

export default function ModelSelector({
  onModelSelect,
  selectedModel,
  filterByCapability,
  filterByProvider,
  filterByCostTier,
  visionOnly = false,
  className = ''
}: ModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only fetch models once when the component mounts
    if (!isInitialized) {
      const fetchModels = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch('/api/ai/models');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Ensure models are in the expected format
          const modelsList = data.models || [];
          setModels(modelsList);
          
          // Auto-select the first model if none is selected
          if (!selectedModel && modelsList.length > 0) {
            // If vision only, select first vision-capable model
            if (visionOnly) {
              const visionModels = modelsList.filter(m => VISION_CAPABLE_MODELS.includes(m.id));
              if (visionModels.length > 0) {
                onModelSelect(visionModels[0].id);
              }
            } else {
              onModelSelect(modelsList[0].id);
            }
          }
          
          setIsInitialized(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch models');
          console.error('Error fetching models:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchModels();
    }
  }, [isInitialized, onModelSelect, selectedModel, visionOnly]);

  // If the visionOnly flag changes, we need to make sure a valid model is selected
  useEffect(() => {
    if (selectedModel && visionOnly && !VISION_CAPABLE_MODELS.includes(selectedModel)) {
      const visionModels = models.filter(m => VISION_CAPABLE_MODELS.includes(m.id));
      if (visionModels.length > 0) {
        onModelSelect(visionModels[0].id);
      }
    }
  }, [visionOnly, selectedModel, models, onModelSelect]);

  // Filter models based on props
  const filteredModels = models.filter(model => {
    let include = true;
    
    if (visionOnly) {
      include = include && VISION_CAPABLE_MODELS.includes(model.id);
    }
    
    if (filterByCapability && model.capabilities) {
      include = include && model.capabilities.includes(filterByCapability);
    }
    
    if (filterByProvider && model.provider) {
      include = include && model.provider === filterByProvider;
    }
    
    if (filterByCostTier && model.costTier) {
      include = include && model.costTier === filterByCostTier;
    }
    
    return include;
  });

  // Group models by provider
  const groupedModels: Record<string, AIModel[]> = {};
  
  filteredModels.forEach(model => {
    const provider = model.provider || 'Other';
    if (!groupedModels[provider]) {
      groupedModels[provider] = [];
    }
    groupedModels[provider].push(model);
  });

  return (
    <div className={`${className} p-4 rounded-md border border-gray-300`}>
      <h2 className="text-xl font-semibold mb-4">
        Select AI Model 
        {visionOnly && <span className="text-blue-600 text-sm ml-2">(Vision-capable only)</span>}
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <span className="animate-pulse">Loading models...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <p>{error}</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded">
          <p>No models match your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedModels).map(provider => (
            <div key={provider}>
              <h3 className="font-medium text-gray-600 mb-2">{provider}</h3>
              <div className="space-y-2">
                {groupedModels[provider].map(model => (
                  <div 
                    key={model.id}
                    className={`
                      p-3 rounded-md cursor-pointer
                      ${selectedModel === model.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}
                      ${visionOnly && VISION_CAPABLE_MODELS.includes(model.id) ? 'border-blue-200' : ''}
                    `}
                    onClick={() => onModelSelect(model.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {model.name}
                          {VISION_CAPABLE_MODELS.includes(model.id) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Vision
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{model.id}</div>
                      </div>
                      {model.costSavings && (
                        <span className={`
                          text-sm px-2 py-1 rounded
                          ${model.costSavings.includes('Save') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'}
                        `}>
                          {model.costSavings}
                        </span>
                      )}
                    </div>
                    
                    {/* Show capabilities as tags */}
                    {model.capabilities && model.capabilities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {model.capabilities.map(capability => (
                          <span 
                            key={capability} 
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 