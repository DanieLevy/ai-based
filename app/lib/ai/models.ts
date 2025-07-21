// Model definitions and types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  costTier: string;
  costSavings?: string;
}

// Available models based on the documentation
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "us.amazon.nova-micro-v1:0",
    name: "Nova G1 – Micro",
    provider: "Amazon",
    capabilities: ["text-generation", "chat"],
    costTier: "ultra-low",
    costSavings: "Save 98.6%"
  },
  {
    id: "us.amazon.nova-lite-v1:0",
    name: "Nova G1 – Lite",
    provider: "Amazon",
    capabilities: ["text-generation", "chat"],
    costTier: "ultra-low",
    costSavings: "Save 98.1%"
  },
  {
    id: "us.amazon.nova-pro-v1:0",
    name: "Nova G1 – Pro",
    provider: "Amazon",
    capabilities: ["text-generation", "chat"],
    costTier: "low",
    costSavings: "Save 89.5%"
  },
  {
    id: "ai21.jamba-1-5-mini-v1:0",
    name: "Jamba 1.5 Mini",
    provider: "AI21 Labs",
    capabilities: ["text-generation", "chat"],
    costTier: "ultra-low",
    costSavings: "Save 95%"
  },
  {
    id: "us.anthropic.claude-3-haiku-20240307-v1:0",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat"],
    costTier: "low",
    costSavings: "Save 92%"
  },
  {
    id: "ai21.jamba-instruct-v1:0",
    name: "Jamba-Instruct",
    provider: "AI21 Labs",
    capabilities: ["text-generation", "chat", "instruction-following"],
    costTier: "low",
    costSavings: "Save 83%"
  },
  {
    id: "anthropic.claude-instant-v1",
    name: "Claude Instant",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat"],
    costTier: "medium",
    costSavings: "Save 73%"
  },
  {
    id: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning"],
    costTier: "medium",
    costSavings: "Save 73%"
  },
  {
    id: "ai21.jamba-1-5-large-v1:0",
    name: "Jamba 1.5 Large",
    provider: "AI21 Labs",
    capabilities: ["text-generation", "chat", "reasoning"],
    costTier: "medium-high",
    costSavings: "Save 47%"
  },
  {
    id: "us.amazon.nova-premier-v1:0",
    name: "Nova G1 – Premier",
    provider: "Amazon",
    capabilities: ["text-generation", "chat", "reasoning"],
    costTier: "high",
    costSavings: "Save 17%"
  },
  {
    id: "us.anthropic.claude-3-sonnet-20240229-v1:0",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks"],
    costTier: "high",
    costSavings: "—"
  },
  {
    id: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks"],
    costTier: "high",
    costSavings: "—"
  },
  {
    id: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    name: "Claude 3.5 Sonnet v2",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks"],
    costTier: "high",
    costSavings: "—"
  },
  {
    id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks"],
    costTier: "high",
    costSavings: "—"
  },
  {
    id: "us.anthropic.claude-sonnet-4-20250514-v1:0",
    name: "Claude 4.0 Sonnet",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks", "advanced-reasoning"],
    costTier: "premium",
    costSavings: "—"
  },
  {
    id: "anthropic.claude-v2",
    name: "Claude 2",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning"],
    costTier: "premium",
    costSavings: "Costs 167% more"
  },
  {
    id: "anthropic.claude-v2:1",
    name: "Claude 2.1",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning"],
    costTier: "premium",
    costSavings: "Costs 167% more"
  },
  {
    id: "mistral.mistral-large-2402-v1:0",
    name: "Mistral Large (24.02)",
    provider: "Mistral AI",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks"],
    costTier: "premium",
    costSavings: "Costs 167% more"
  },
  {
    id: "us.anthropic.claude-3-opus-20240229-v1:0",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks", "advanced-reasoning"],
    costTier: "ultra-premium",
    costSavings: "Costs 400% more"
  },
  {
    id: "us.anthropic.claude-opus-4-20250514-v1:0",
    name: "Claude 4.0 Opus",
    provider: "Anthropic",
    capabilities: ["text-generation", "chat", "reasoning", "complex-tasks", "advanced-reasoning"],
    costTier: "ultra-premium",
    costSavings: "Costs 400% more"
  }
];

// Model categories based on use cases
export const MODEL_CATEGORIES = {
  simpleTasks: ["us.amazon.nova-micro-v1:0", "us.amazon.nova-lite-v1:0"],
  contentGeneration: ["ai21.jamba-1-5-mini-v1:0", "ai21.jamba-instruct-v1:0", "us.anthropic.claude-3-haiku-20240307-v1:0"],
  complexReasoning: ["us.anthropic.claude-3-5-haiku-20241022-v1:0", "ai21.jamba-1-5-large-v1:0"],
  advancedCapabilities: [
    "us.anthropic.claude-3-sonnet-20240229-v1:0",
    "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "us.anthropic.claude-sonnet-4-20250514-v1:0"
  ]
};

// Helper function to select a model based on task type
export function selectModelByTask(taskType: string, complexity: "low" | "medium" | "high", budgetPriority: "maximum_savings" | "balanced" | "performance"): string {
  if (budgetPriority === "maximum_savings") {
    if (taskType === "classification" || taskType === "extraction") {
      return "us.amazon.nova-micro-v1:0";
    } else if (taskType === "content_generation" || taskType === "creative") {
      return "ai21.jamba-1-5-mini-v1:0";
    }
  }

  if (complexity === "high") {
    if (budgetPriority === "balanced") {
      return "us.anthropic.claude-3-5-haiku-20241022-v1:0";
    } else if (budgetPriority === "performance") {
      return "us.anthropic.claude-3-7-sonnet-20250219-v1:0";
    }
  }

  // Default balanced option
  return "us.anthropic.claude-3-5-haiku-20241022-v1:0";
}

// Get model by ID
export function getModelById(id: string): AIModel | undefined {
  return AVAILABLE_MODELS.find(model => model.id === id);
}

// Filter models by capability
export function getModelsByCapability(capability: string): AIModel[] {
  return AVAILABLE_MODELS.filter(model => model.capabilities.includes(capability));
}

// Filter models by cost tier
export function getModelsByCostTier(tier: string): AIModel[] {
  return AVAILABLE_MODELS.filter(model => model.costTier === tier);
}

// Filter models by provider
export function getModelsByProvider(provider: string): AIModel[] {
  return AVAILABLE_MODELS.filter(model => model.provider === provider);
} 