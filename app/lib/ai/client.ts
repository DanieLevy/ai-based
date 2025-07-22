import { v4 as uuidv4 } from 'uuid';
import * as logger from './logging';
import { estimateTokenCount } from './costCalculator';
import { getModelById } from './models';
import { getSofiaToken } from './auth';

// Default API configuration
const DEFAULT_CONFIG = {
  baseUrl: process.env.OPENAI_BASE_URL || 'https://sofia-api.lgw.cloud.mobileye.com/v1/api',
  defaultModel: process.env.MODEL || 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
  timeout: 60000, // 60 seconds
  maxRetries: 2
};

// Request options interface
export interface RequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  timeout?: number;
}

// Message interface for chat conversations
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

// Chat completion response
export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Sofia AI API Client
 * A client for interacting with OpenAI-compatible Sofia API
 */
export class SofiaAIClient {
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;
  private maxRetries: number;
  private apiKey?: string;

  /**
   * Create a new Sofia AI client
   * 
   * @param config Configuration options for the client
   */
  constructor(config: {
    baseUrl?: string;
    defaultModel?: string;
    timeout?: number;
    maxRetries?: number;
    apiKey?: string;
  } = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
    this.defaultModel = config.defaultModel || DEFAULT_CONFIG.defaultModel;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout;
    this.maxRetries = config.maxRetries || DEFAULT_CONFIG.maxRetries;
    this.apiKey = config.apiKey;
    
    if (!this.baseUrl) {
      logger.warn('No base URL provided. API calls will fail unless a base URL is provided at request time.');
    }
  }

  /**
   * Get authentication token - either from provided apiKey or from getSofiaToken()
   */
  private async getAuthToken(): Promise<string> {
    return this.apiKey || await getSofiaToken();
  }

  /**
   * Get a list of available models
   * 
   * @returns Promise resolving to the list of models
   */
  async listModels(): Promise<any> {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    try {
      logger.info('Fetching available models', {}, undefined, requestId);
      
      // First try to get models from the API
      try {
        const response = await fetch(`${this.baseUrl}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching models: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        logger.logApiResponse(
          'system', 
          requestId, 
          { models: data.models?.length || 0 }, 
          startTime, 
          Date.now()
        );
        
        return data;
      } catch (error) {
        // If external API fails, return an empty result
        logger.warn(`External API models fetch failed: ${error instanceof Error ? error.message : String(error)}`, {}, undefined, requestId);
        return { models: [] };
      }
    } catch (error) {
      logger.logApiError('system', requestId, error, startTime);
      throw error;
    }
  }

  /**
   * Create a chat completion
   * 
   * @param messages Array of messages to include in the completion
   * @param options Request options
   * @param modelId Optional model ID to use (overrides default)
   * @returns Promise resolving to the completion response
   */
  async createChatCompletion(
    messages: Message[],
    options: RequestOptions = {},
    modelId?: string
  ): Promise<CompletionResponse> {
    const model = modelId || this.defaultModel;
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Estimate input token count
    const messageText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(messageText);
    
    try {
      const requestBody = {
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop,
      };
      
      // Log the API request
      logger.logApiRequest(model, requestId, requestBody);
      
      let retries = 0;
      let response;
      
      // Retry logic
      while (retries <= this.maxRetries) {
        try {
          // Get a fresh token for each attempt
          const apiKey = await this.getAuthToken();
          
          // Make the API request
          response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: options.timeout ? AbortSignal.timeout(options.timeout) : AbortSignal.timeout(this.timeout)
          });
          
          if (response.ok) {
            break;
          }
          
          // If rate limited, wait and retry
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * Math.pow(2, retries);
            
            logger.warn(`Rate limited. Retrying after ${waitTime}ms`, {}, model, requestId);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          }
          
          // For other errors, don't retry
          break;
        } catch (error) {
          // Only retry on timeout or network errors
          if (retries < this.maxRetries && (error instanceof TypeError || error.name === 'AbortError')) {
            logger.warn(`Request failed. Retrying (${retries + 1}/${this.maxRetries})`, { error }, model, requestId);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            continue;
          }
          throw error;
        }
      }
      
      // Handle unsuccessful responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      
      // Estimate output token count
      const outputText = data.choices?.[0]?.message?.content || '';
      const estimatedOutputTokens = estimateTokenCount(outputText);
      
      // Log successful response
      logger.logApiResponse(
        model,
        requestId,
        data,
        startTime,
        Date.now(),
        data.usage?.prompt_tokens || estimatedInputTokens,
        data.usage?.completion_tokens || estimatedOutputTokens
      );
      
      return data;
    } catch (error) {
      // Log error
      logger.logApiError(model, requestId, error, startTime);
      throw error;
    }
  }

  /**
   * Create a text completion (legacy)
   * 
   * @param prompt The prompt for completion
   * @param options Request options
   * @param modelId Optional model ID to use (overrides default)
   * @returns Promise resolving to the completion response
   */
  async createCompletion(
    prompt: string,
    options: RequestOptions = {},
    modelId?: string
  ): Promise<CompletionResponse> {
    // Convert to chat format
    return this.createChatCompletion(
      [{ role: 'user', content: prompt }],
      options,
      modelId
    );
  }

  /**
   * Create a chat conversation with a system prompt
   * 
   * @param systemPrompt The system prompt to guide the conversation
   * @returns Chat conversation interface
   */
  createConversation(systemPrompt: string = 'You are a helpful assistant.') {
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    return {
      /**
       * Add a user message to the conversation
       * 
       * @param content User message content
       * @returns Updated conversation object
       */
      addUserMessage: (content: string) => {
        messages.push({ role: 'user', content });
        return this;
      },

      /**
       * Add an assistant message to the conversation
       * 
       * @param content Assistant message content
       * @returns Updated conversation object
       */
      addAssistantMessage: (content: string) => {
        messages.push({ role: 'assistant', content });
        return this;
      },

      /**
       * Get all messages in the conversation
       * 
       * @returns Array of messages
       */
      getMessages: () => [...messages],

      /**
       * Generate a completion based on the conversation so far
       * 
       * @param options Request options
       * @param modelId Optional model ID to use (overrides default)
       * @returns Promise resolving to the completion response
       */
      complete: async (options: RequestOptions = {}, modelId?: string) => {
        const response = await this.createChatCompletion(messages, options, modelId);
        
        // Add the assistant's response to the conversation
        if (response.choices && response.choices.length > 0) {
          messages.push(response.choices[0].message);
        }
        
        return response;
      }
    };
  }
}

// Create and export a default client
export const defaultClient = new SofiaAIClient();

// Export a function to create a new client
export function createClient(config = {}): SofiaAIClient {
  return new SofiaAIClient(config);
} 