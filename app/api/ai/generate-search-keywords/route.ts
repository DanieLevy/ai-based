import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { defaultClient } from '@/app/lib/ai/client';
import * as logger from '@/app/lib/ai/logging';

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    const { query, model = process.env.MODEL || 'ai21.jamba-1-5-large-v1:0' } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    logger.info(`Generating search keywords for query: "${query}"`, { query }, model, requestId);
    
    const systemPrompt = `You are a search keyword optimization assistant designed to help find relevant information in a technical knowledge base.

Your task is to analyze a user's question and generate a set of optimized search terms that would most effectively find relevant information in a technical documentation system (Confluence).

INSTRUCTIONS:
1. Analyze the user's question to understand the core technical concepts they're asking about
2. Extract the most important technical terms, acronyms, and concepts
3. Add relevant synonyms, related technical terms, or alternative phrasings that might appear in documentation
4. For technical acronyms, include both the acronym and its possible expanded forms
5. For product names or code identifiers, include variations of capitalization or formatting
6. Return a JSON array of search terms, ordered by relevance (most important first)
7. Include at least 3 and up to 8 search terms

The output should ONLY be a valid JSON array of strings, nothing else.
Example output: ["term1", "term2", "term3"]

DO NOT include any explanation, introduction or other text - ONLY return the JSON array.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ];
    
    const response = await defaultClient.createChatCompletion(messages, {}, model);
    
    // Try to parse the response as JSON
    let keywords = [];
    try {
      // Clean the response - sometimes AI adds markdown code formatting
      const cleanedResponse = response.choices[0].message.content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      keywords = JSON.parse(cleanedResponse);
      
      // Ensure the response is an array of strings
      if (!Array.isArray(keywords)) {
        keywords = [query];
      } else {
        // Make sure all items are strings
        keywords = keywords.filter(k => typeof k === 'string');
        
        // If no valid keywords were found, use the original query
        if (keywords.length === 0) {
          keywords = [query];
        }
      }
    } catch (error) {
      logger.warn(`Failed to parse keywords from AI response: ${error}`, 
        { aiResponse: response.choices[0].message.content }, model, requestId);
      keywords = [query];
    }
    
    const endTime = Date.now();
    logger.logApiResponse(model, requestId, response, startTime, endTime);
    
    return NextResponse.json({
      success: true,
      query,
      keywords,
      originalAiResponse: response.choices[0].message.content
    });
    
  } catch (error) {
    const endTime = Date.now();
    logger.logApiError('system', requestId, error, startTime);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate search keywords',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallbackKeywords: [request.json().then(data => data.query).catch(() => '')]
    }, { status: 500 });
  }
} 