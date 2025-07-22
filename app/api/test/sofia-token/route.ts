import { NextResponse } from 'next/server';
import { getSofiaToken } from '@/app/lib/ai/auth';
import { SofiaAIClient } from '@/app/lib/ai/client';

/**
 * This is a test endpoint to verify that our dynamic token system works properly.
 * It gets a token and makes a simple API call to the Sofia API.
 */
export async function GET() {
  try {
    // Test results to return
    const results = {
      tokenSuccess: false,
      apiSuccess: false,
      modelsSuccess: false,
      error: null,
      token: null, // Will be null or masked
      models: null,
      apiResponse: null
    };
    
    // Step 1: Get a token
    let token = null;
    try {
      token = await getSofiaToken();
      console.log("Token acquired:", token ? "YES" : "NO");
      
      if (token && token.length > 20) {
        results.tokenSuccess = true;
        // Mask the token for security, just show the first few and last few characters
        results.token = `${token.substring(0, 10)}...${token.substring(token.length - 5)}`;
      } else {
        throw new Error('Invalid token received');
      }
    } catch (error) {
      results.error = `Token error: ${error instanceof Error ? error.message : String(error)}`;
      return NextResponse.json(results, { status: 500 });
    }
    
    // Create a properly initialized client
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://sofia-api.lgw.cloud.mobileye.com/v1/api';
    const client = new SofiaAIClient({
      baseUrl: baseUrl,
      apiKey: token, // Fixed: Passing token as apiKey
    });
    
    // Step 2: Make a simple API call to list models
    try {
      console.log("Fetching available models");
      const models = await client.listModels();
      results.modelsSuccess = true;
      results.models = models.models?.length || 0;
    } catch (error) {
      results.error = `Models error: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    // Step 3: Try a simple completion
    try {
      const chatResponse = await client.createChatCompletion([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ], {}, 'ai21.jamba-1-5-mini-v1:0'); // Use a smaller model for quicker testing
      
      results.apiSuccess = true;
      results.apiResponse = chatResponse.choices?.[0]?.message?.content?.substring(0, 50) || 'No response';
    } catch (error) {
      results.error = `API error: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    // Return all results
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ 
      error: `Overall error: ${error instanceof Error ? error.message : String(error)}` 
    }, { 
      status: 500 
    });
  }
} 