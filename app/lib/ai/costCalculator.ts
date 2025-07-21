import { getModelById } from './models';

// Base cost multiplier relative to Claude 3.7 Sonnet
// These are approximate based on the savings percentages in the documentation
const COST_MULTIPLIERS: Record<string, number> = {
  "us.amazon.nova-micro-v1:0": 0.014, // Save 98.6%
  "us.amazon.nova-lite-v1:0": 0.019, // Save 98.1%
  "us.amazon.nova-pro-v1:0": 0.105, // Save 89.5%
  "ai21.jamba-1-5-mini-v1:0": 0.05, // Save 95%
  "us.anthropic.claude-3-haiku-20240307-v1:0": 0.08, // Save 92%
  "ai21.jamba-instruct-v1:0": 0.17, // Save 83%
  "anthropic.claude-instant-v1": 0.27, // Save 73%
  "us.anthropic.claude-3-5-haiku-20241022-v1:0": 0.27, // Save 73%
  "ai21.jamba-1-5-large-v1:0": 0.53, // Save 47%
  "us.amazon.nova-premier-v1:0": 0.83, // Save 17%
  "us.anthropic.claude-3-sonnet-20240229-v1:0": 1.0, // Base reference
  "us.anthropic.claude-3-5-sonnet-20240620-v1:0": 1.0, 
  "us.anthropic.claude-3-5-sonnet-20241022-v2:0": 1.0,
  "us.anthropic.claude-3-7-sonnet-20250219-v1:0": 1.0,
  "us.anthropic.claude-sonnet-4-20250514-v1:0": 1.0,
  "anthropic.claude-v2": 2.67, // Costs 167% more
  "anthropic.claude-v2:1": 2.67, // Costs 167% more
  "mistral.mistral-large-2402-v1:0": 2.67, // Costs 167% more
  "us.anthropic.claude-3-opus-20240229-v1:0": 5.0, // Costs 400% more
  "us.anthropic.claude-opus-4-20250514-v1:0": 5.0 // Costs 400% more
};

// Base rates per million tokens (these are approximate and should be updated with real rates)
// Assuming $10 per million input tokens and $30 per million output tokens for Claude 3.7 Sonnet
const BASE_RATES = {
  input: 10, // $10 per million input tokens
  output: 30 // $30 per million output tokens
};

/**
 * Calculate the estimated cost for a specific model and token counts
 * 
 * @param modelId The ID of the model
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns The estimated cost in dollars
 */
export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  // Get the cost multiplier for the model
  const multiplier = COST_MULTIPLIERS[modelId] || 1.0;
  
  // Calculate the cost based on token counts
  const inputCost = (inputTokens / 1000000) * BASE_RATES.input * multiplier;
  const outputCost = (outputTokens / 1000000) * BASE_RATES.output * multiplier;
  
  // Return the total cost
  return inputCost + outputCost;
}

/**
 * Estimate token count from a text string (very approximate)
 * 
 * @param text The input text
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Very rough estimation: ~4 chars per token on average
  return Math.ceil(text.length / 4);
}

/**
 * Compare costs for multiple models for the same input/output
 * 
 * @param modelIds Array of model IDs to compare
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns Object with model IDs as keys and costs as values
 */
export function compareCosts(modelIds: string[], inputTokens: number, outputTokens: number): Record<string, number> {
  const costs: Record<string, number> = {};
  
  modelIds.forEach(modelId => {
    costs[modelId] = calculateCost(modelId, inputTokens, outputTokens);
  });
  
  return costs;
}

/**
 * Get cost savings percentage compared to a reference model
 * 
 * @param modelId The model to calculate savings for
 * @param referenceModelId The reference model (defaults to Claude 3.7 Sonnet)
 * @returns Percentage savings (negative means more expensive)
 */
export function getCostSavingsPercentage(modelId: string, referenceModelId: string = 'us.anthropic.claude-3-7-sonnet-20250219-v1:0'): number {
  const modelMultiplier = COST_MULTIPLIERS[modelId] || 1.0;
  const referenceMultiplier = COST_MULTIPLIERS[referenceModelId] || 1.0;
  
  return ((referenceMultiplier - modelMultiplier) / referenceMultiplier) * 100;
}

/**
 * Suggest the most cost-effective model for a given task type
 * 
 * @param taskType The type of task (simple, content, reasoning, advanced)
 * @param prioritizeCost Whether to prioritize cost over performance
 * @returns The suggested model ID
 */
export function suggestCostEffectiveModel(taskType: 'simple' | 'content' | 'reasoning' | 'advanced', prioritizeCost: boolean = false): string {
  if (taskType === 'simple') {
    return prioritizeCost 
      ? 'us.amazon.nova-micro-v1:0'  // Cheapest
      : 'us.amazon.nova-pro-v1:0';   // Better performance but still cheap
  } else if (taskType === 'content') {
    return prioritizeCost
      ? 'ai21.jamba-1-5-mini-v1:0'   // Cheaper
      : 'us.anthropic.claude-3-haiku-20240307-v1:0'; // Better quality
  } else if (taskType === 'reasoning') {
    return prioritizeCost
      ? 'us.anthropic.claude-3-5-haiku-20241022-v1:0' // Good balance
      : 'ai21.jamba-1-5-large-v1:0'; // Better for specific types of reasoning
  } else {
    return prioritizeCost
      ? 'us.anthropic.claude-3-5-sonnet-20240620-v1:0' // Cheaper advanced model
      : 'us.anthropic.claude-3-7-sonnet-20250219-v1:0'; // Best performance
  }
} 