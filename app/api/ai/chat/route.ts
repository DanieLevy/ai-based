import { NextResponse } from 'next/server';
import { defaultClient } from '@/app/lib/ai/client';
import * as logger from '@/app/lib/ai/logging';
import { calculateCost, estimateTokenCount } from '@/app/lib/ai/costCalculator';

export async function POST(request: Request) {
  try {
    const { 
      messages, 
      model = process.env.MODEL || 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
      temperature = 0.7,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      stop
    } = await request.json();
    
    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate temperature (ensure it's between 0 and 1)
    const validatedTemperature = Math.max(0, Math.min(1, parseFloat(temperature) || 0.7));
    if (validatedTemperature !== temperature) {
      logger.warn(`Temperature value ${temperature} was out of range, clamped to ${validatedTemperature}`, 
        { originalValue: temperature, newValue: validatedTemperature });
    }
    
    logger.info('Processing chat completion request', { model, messageCount: messages.length });
    
    // Estimate input token count for cost estimation
    const messageText = messages.map((m: any) => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(messageText);
    
    const startTime = Date.now();
    
    try {
      // Call the AI API
      const result = await defaultClient.createChatCompletion(
        messages,
        {
          temperature: validatedTemperature,
          maxTokens: max_tokens,
          topP: top_p,
          frequencyPenalty: frequency_penalty,
          presencePenalty: presence_penalty,
          stop
        },
        model
      );
      
      const endTime = Date.now();
      
      // Calculate stats
      const responseText = result.choices?.[0]?.message?.content || '';
      const estimatedOutputTokens = result.usage?.completion_tokens || estimateTokenCount(responseText);
      const estimatedCost = calculateCost(model, 
        result.usage?.prompt_tokens || estimatedInputTokens, 
        estimatedOutputTokens
      );
      
      logger.info('Chat completion successful', { 
        model, 
        duration: endTime - startTime,
        promptTokens: result.usage?.prompt_tokens || estimatedInputTokens,
        completionTokens: estimatedOutputTokens,
        estimatedCost
      });
      
      return NextResponse.json({
        ...result,
        _metadata: {
          responseTime: endTime - startTime,
          estimatedCost
        }
      });
    } catch (error) {
      logger.error('Chat completion failed', { 
        error: error instanceof Error ? error.message : String(error),
        model
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to generate chat completion',
          message: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error processing request', { error });
    
    return NextResponse.json(
      { error: 'Invalid request format', message: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
} 