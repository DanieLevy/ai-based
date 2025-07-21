import { NextResponse } from 'next/server';
import * as logger from '@/app/lib/ai/logging';
import { calculateCost, estimateTokenCount } from '@/app/lib/ai/costCalculator';
import { VISION_CAPABLE_MODELS } from '@/app/lib/ai/models';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get form data
    const image = formData.get('image') as File | null;
    const prompt = formData.get('prompt') as string || 'Describe this image in detail.';
    const modelId = formData.get('model') as string;
    const temperature = parseFloat(formData.get('temperature') as string || '0.7');
    
    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }
    
    if (!modelId || !VISION_CAPABLE_MODELS.includes(modelId)) {
      return NextResponse.json(
        { error: 'A valid vision-capable model ID is required' },
        { status: 400 }
      );
    }
    
    // Validate temperature (ensure it's between 0 and 1)
    const validatedTemperature = Math.max(0, Math.min(1, temperature));
    
    // Convert image to base64
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = image.type || 'image/jpeg';
    
    logger.info(`Processing vision request with model: ${modelId}`, { prompt, imageSize: imageBuffer.byteLength });
    
    // Construct message for the API
    const messages = [
      { 
        role: 'user', 
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ];
    
    const startTime = Date.now();
    
    try {
      // Make request to the Sofia API
      const response = await fetch(`${process.env.OPENAI_BASE_URL || 'https://sofia-api.lgw.cloud.mobileye.com/v1/api'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          temperature: validatedTemperature,
          max_tokens: 1500,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const result = await response.json();
      const endTime = Date.now();
      
      // Calculate stats
      const responseText = result.choices?.[0]?.message?.content || '';
      // Image token counting is approximate since it depends on resolution
      const estimatedImageTokens = Math.floor(imageBuffer.byteLength / 500); // Very rough approximation
      const estimatedInputTokens = estimateTokenCount(prompt) + estimatedImageTokens;
      const estimatedOutputTokens = result.usage?.completion_tokens || estimateTokenCount(responseText);
      const estimatedCost = calculateCost(modelId, 
        result.usage?.prompt_tokens || estimatedInputTokens, 
        estimatedOutputTokens
      );
      
      logger.info('Vision API completion successful', { 
        model: modelId, 
        duration: endTime - startTime,
        estimatedInputTokens,
        estimatedOutputTokens,
        estimatedCost
      });
      
      return NextResponse.json({
        ...result,
        _metadata: {
          responseTime: endTime - startTime,
          estimatedCost,
          imageSize: imageBuffer.byteLength,
        }
      });
    } catch (error) {
      logger.error('Vision API completion failed', { 
        error: error instanceof Error ? error.message : String(error),
        model: modelId
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to process image',
          message: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error processing vision request', { error });
    
    return NextResponse.json(
      { error: 'Invalid request format', message: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
} 