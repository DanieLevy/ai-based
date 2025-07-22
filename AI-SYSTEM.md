# Sofia AI Integration System

This document provides an overview of the AI integration system built for interacting with Sofia's OpenAI-compatible API and various LLM models.

## System Architecture

The system is organized into several key components:

### Core Libraries

- **`models.ts`**: Defines available AI models, their capabilities, and helper functions for model selection
- **`logging.ts`**: Provides comprehensive logging for API calls, errors, and performance metrics
- **`costCalculator.ts`**: Utilities for estimating token usage and calculating costs for different models
- **`client.ts`**: Main API client for making requests to the Sofia API with error handling and retries
- **`auth.ts`**: Manages dynamic token acquisition and refreshing for API authentication

### API Endpoints

- **`/api/ai/models`**: Returns information about available AI models
- **`/api/ai/chat`**: Handles chat completion requests with multiple messages
- **`/api/ai/completion`**: Handles simple text completion requests
- **`/api/ai/logs`**: Provides access to system logs and performance metrics
- **`/api/auth/refresh-token`**: Handles authentication token acquisition and refresh

### UI Components

- **`ModelSelector`**: Component for browsing and selecting AI models
- **`ApiTester`**: Testing interface for trying different models and parameters
- **`LogViewer`**: Interface for viewing logs, metrics, and performance statistics
- **`TokenTest`**: Interface for testing the token acquisition and API functionality

## Authentication System

The system uses a dynamic token-based authentication approach:

### Token Management

1. **Python Integration**: Uses a Python script (`me_token_manager.py`) to fetch fresh tokens
2. **Token Expiration**: Tokens expire after 10 minutes to ensure security
3. **Caching Strategy**: Tokens are cached to minimize refresh calls
4. **Fallback Mechanisms**: Multiple fallbacks ensure system reliability:
   - Python script (primary method)
   - Environment variables
   - Local storage (client-side only)

### How Authentication Works

1. The `getSofiaToken()` function in `auth.ts` is the primary entry point
2. It first checks for a valid cached token
3. If no valid token exists, it requests one from `/api/auth/refresh-token`
4. The API endpoint executes the Python script to get a fresh token
5. If the Python script fails, it falls back to environment variables

### Implementation Example

```typescript
// Client example using token authentication
import { SofiaAIClient } from '@/app/lib/ai/client';

// The client will automatically handle token acquisition
const client = new SofiaAIClient();

// Or provide a specific token
const client = new SofiaAIClient({
  apiKey: 'your-token-here' // Optional: provide a specific token
});

// Make authenticated requests
const response = await client.createChatCompletion([
  { role: 'user', content: 'Hello!' }
]);
```

## How to Use

### Making API Requests

To make a request to the AI API from your frontend:

```javascript
// Chat completion example
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, can you help me with...' }
    ],
    model: 'us.anthropic.claude-3-5-haiku-20241022-v1:0', // Optional - defaults to env variable
    temperature: 0.7 // Optional - defaults to 0.7
  })
});

const result = await response.json();
const aiResponse = result.choices[0].message.content;
```

### Selecting the Right Model

The system supports different models for different use cases:

1. **Simple Tasks**: Use Nova G1 models (e.g., `us.amazon.nova-micro-v1:0`)
   - Basic text classification, simple Q&A, straightforward text extraction
   - Up to 98.6% cost savings

2. **Content Generation**: Use Jamba or Haiku models (e.g., `us.anthropic.claude-3-haiku-20240307-v1:0`)
   - Blog posts, product descriptions, creative writing
   - Up to 95% cost savings

3. **Complex Reasoning**: Use Claude 3.5 Haiku (e.g., `us.anthropic.claude-3-5-haiku-20241022-v1:0`)
   - Multi-step problem solving, code generation, detailed analysis
   - Up to 73% cost savings

4. **Advanced Capabilities**: Use Claude 3.5+ Sonnet models
   - Complex code generation, advanced reasoning tasks, mission-critical applications
   - Best performance at higher cost

### Cost Optimization

To optimize costs:

1. Choose the appropriate model for your task's complexity
2. Implement a tiered approach - start with cheaper models and escalate as needed
3. Use the `costCalculator.ts` utilities to estimate and compare costs

## Implementation Guidelines

### Adding New Features

When adding new AI-powered features:

1. Import the client from `app/lib/ai/client.ts`
2. Use the appropriate model for your task (see model selection guide)
3. Add proper error handling and logging
4. Implement rate limiting and retries for important operations

Example:

```typescript
import { defaultClient } from '@/app/lib/ai/client';
import * as logger from '@/app/lib/ai/logging';

async function generateSummary(text: string) {
  try {
    // Choose appropriate model based on task complexity
    const model = 'us.amazon.nova-pro-v1:0'; // Good for simple text summarization
    
    const result = await defaultClient.createCompletion(
      `Summarize this text in 3 bullet points: ${text}`,
      { temperature: 0.3 }, // Lower temperature for more deterministic output
      model
    );
    
    return result.choices[0].message.content;
  } catch (error) {
    logger.error('Summary generation failed', { error, text: text.substring(0, 100) });
    throw new Error('Failed to generate summary');
  }
}
```

### Best Practices

1. **Parameter Validation**: Always validate input parameters, especially temperature (must be between 0 and 1)
2. **Error Handling**: Implement comprehensive error handling with informative messages
3. **Logging**: Use the logging utilities to track API calls, errors, and performance metrics
4. **Cost Management**: Be mindful of token usage and choose models appropriately
5. **Retry Logic**: Use retry logic for transient errors, with exponential backoff
6. **Token Management**: Let the client handle authentication; only override if necessary

## Testing

The AI Testing Platform at `/ai-test` provides a comprehensive interface for:

1. Testing different models with various prompts and parameters
2. Comparing performance and cost across models
3. Viewing logs and metrics for API calls
4. Analyzing success rates and response times

For testing the token system specifically, visit `/token-test` to verify:
1. Token acquisition is working
2. API calls with the token succeed
3. Chat completions are functioning correctly

## Environment Configuration

Configure the system using environment variables:

- `OPENAI_API_KEY`: Your Sofia API key (fallback when Python script fails)
- `OPENAI_BASE_URL`: Base URL for the Sofia API (default: https://sofia-api.lgw.cloud.mobileye.com/v1/api)
- `MODEL`: Default model to use for API calls
- `NEXT_PUBLIC_APP_URL`: Your application's base URL (for server-side token requests)

## Support and Maintenance

For questions or issues with the AI integration system:

- Check logs at `/api/ai/logs` for detailed error information
- Review the model's documentation for specific limitations or requirements
- Consult with the Sofia API documentation for any API-specific issues
- For token-related issues, check the Python script execution logs 