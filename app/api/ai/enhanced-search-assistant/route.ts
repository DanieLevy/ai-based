import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { defaultClient } from '@/app/lib/ai/client';
import * as logger from '@/app/lib/ai/logging';
import { calculateCost } from '@/app/lib/ai/costCalculator';

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  try {
    const { query, model = process.env.MODEL || 'us.anthropic.claude-3-5-sonnet-20240620-v1:0', maxResults = 5 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    logger.info(`Processing enhanced knowledge search for query: "${query}"`, { query, model }, model, requestId);
    
    // Step 1: Generate optimized search keywords using AI
    logger.info(`Generating search keywords for query: "${query}"`, { query }, model, requestId);
    
    const keywordsResponse = await fetch(`${request.headers.get('origin')}/api/ai/generate-search-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, model: 'ai21.jamba-1-5-large-v1:0' }) // Use a faster model for keyword generation
    });

    if (!keywordsResponse.ok) {
      logger.warn(`Failed to generate keywords: ${keywordsResponse.status}`, { error: await keywordsResponse.text() }, model, requestId);
      // Continue with original query if keyword generation fails
    }

    let keywords = [query]; // Default to original query
    
    try {
      const keywordsData = await keywordsResponse.json();
      if (keywordsData.success && Array.isArray(keywordsData.keywords) && keywordsData.keywords.length > 0) {
        keywords = keywordsData.keywords;
        logger.info(`Generated search keywords: ${keywords.join(', ')}`, { keywords }, model, requestId);
      }
    } catch (error) {
      logger.warn(`Error parsing keyword response: ${error}`, {}, model, requestId);
      // Continue with original query
    }
    
    // Step 2: Search Confluence using semantic search with the generated keywords
    logger.info(`Searching Confluence with keywords: ${keywords.join(', ')}`, { keywords }, model, requestId);
    
    const searchResponse = await fetch(`${request.headers.get('origin')}/api/confluence/semantic-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keywords, query, limit: maxResults, includeContent: true })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      logger.error(`Failed to search Confluence: ${searchResponse.status}`, { error: errorText }, model, requestId);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve information from Confluence',
        details: errorText
      }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      logger.info(`No results found in Confluence for query: "${query}"`, { query, keywords }, model, requestId);
      
      // Generate a response indicating no information was found
      const noResultsResponse = await defaultClient.createChatCompletion([
        { 
          role: 'system', 
          content: `You are a helpful assistant. The user asked: "${query}"

The system searched for these keywords in the company's Confluence knowledge base: ${keywords.join(', ')}

No relevant information was found. Explain that you don't have specific information on this topic from the company's knowledge base. Suggest what the user might search for instead to get better results.` 
        },
        { role: 'user', content: `My question was: ${query}` }
      ], {}, model);
      
      const endTime = Date.now();
      logger.logApiResponse(model, requestId, noResultsResponse, startTime, endTime);
      
      return NextResponse.json({
        success: true,
        query,
        keywords,
        hasResults: false,
        response: noResultsResponse.choices[0].message.content,
        searchResults: [],
        metadata: {
          processingTime: Date.now() - startTime,
          sourceCount: 0,
          model,
          keywords
        }
      });
    }
    
    logger.info(`Found ${searchData.results.length} results in Confluence`, { count: searchData.results.length }, model, requestId);
    
    // Step 3: Prepare context for the AI
    const context = searchData.results.map((result: any, index: number) => 
      `SOURCE ${index + 1}: "${result.title}" from space "${result.space}"\n${result.content}\n\n`
    ).join('\n');
    
    // Step 4: Generate a response using the AI with the retrieved context
    const systemPrompt = `You are a helpful assistant that answers questions based on information from the company's Confluence knowledge base.

USER QUERY: "${query}"

SEARCH KEYWORDS USED: ${keywords.join(', ')}

CONTEXT INFORMATION:
${context}

INSTRUCTIONS:
1. Answer the user's question based ONLY on the information provided in the CONTEXT above
2. If the context doesn't contain enough information to answer the question fully, acknowledge this limitation
3. Cite your sources by referring to the SOURCE numbers (e.g., "According to SOURCE 1...")
4. Be concise and focus on directly answering the question
5. If there are contradictions in the sources, acknowledge them and explain the different perspectives
6. Do NOT make up information or include personal knowledge not found in the sources
7. Format your answer in a clear, readable way with appropriate paragraphs or bullet points as needed
8. If the context doesn't directly address the user's question but contains related information, explain what information is available and how it relates to their question`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ];
    
    logger.info(`Generating AI response with ${searchData.results.length} context sources`, { sourceCount: searchData.results.length, keywords }, model, requestId);
    
    const aiResponse = await defaultClient.createChatCompletion(messages, {}, model);
    
    const endTime = Date.now();
    logger.logApiResponse(model, requestId, aiResponse, startTime, endTime);
    
    // Calculate token usage and cost if available
    let cost = null;
    if (aiResponse.usage) {
      cost = calculateCost(model, aiResponse.usage.prompt_tokens, aiResponse.usage.completion_tokens);
      logger.info(`Request cost: $${cost.toFixed(6)}`, { cost }, model, requestId);
    }
    
    // Step 5: Verify response relevance (basic implementation)
    let relevanceScore = 0;
    const responseText = aiResponse.choices[0].message.content.toLowerCase();
    for (const keyword of keywords) {
      if (responseText.includes(keyword.toLowerCase())) {
        relevanceScore += 1;
      }
    }
    
    // Return the AI-generated response along with search results metadata
    return NextResponse.json({
      success: true,
      query,
      keywords,
      hasResults: true,
      response: aiResponse.choices[0].message.content,
      relevanceScore: Math.min(relevanceScore / keywords.length, 1), // Normalized to 0-1
      searchResults: searchData.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        space: result.space,
        excerpt: result.excerpt
      })),
      metadata: {
        processingTime: Date.now() - startTime,
        sourceCount: searchData.results.length,
        model,
        keywords,
        ...(aiResponse.usage && {
          usage: aiResponse.usage,
          cost
        })
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    logger.logApiError('system', requestId, error, startTime);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process enhanced knowledge search request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 