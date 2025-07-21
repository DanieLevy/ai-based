import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { keywords, query, limit = 10, includeContent = true } = await request.json();
    
    if ((!keywords || !Array.isArray(keywords) || keywords.length === 0) && (!query || typeof query !== 'string')) {
      return NextResponse.json({
        success: false,
        error: 'Either keywords array or query string is required'
      }, { status: 400 });
    }

    const confluenceBaseUrl = process.env.CONFLUENCE_BASE_URL;
    const confluenceToken = process.env.CONFLUENCE_API_TOKEN;
    
    if (!confluenceBaseUrl || !confluenceToken) {
      return NextResponse.json({
        success: false,
        error: 'Confluence credentials are not configured correctly in .env.local'
      }, { status: 500 });
    }

    // Use keywords if provided, otherwise fall back to query
    const searchTerms = keywords && keywords.length > 0 ? keywords : [query];
    const results = [];
    const seenIds = new Set(); // Track unique IDs to avoid duplicates

    // We'll search for each keyword and collect the results
    for (const term of searchTerms) {
      if (!term || typeof term !== 'string') continue;
      
      try {
        // Simplify the CQL query to avoid special characters
        // Instead of using ^ for boosting, we'll manually sort by relevance later
        const cqlQuery = `text ~ "${encodeURIComponent(term)}" OR title ~ "${encodeURIComponent(term)}"`;

        // Search Confluence content using CQL (Confluence Query Language)
        const url = `${confluenceBaseUrl}/rest/api/content/search`;
        const params = new URLSearchParams({
          cql: cqlQuery,
          expand: includeContent ? 'body.storage,space' : 'space',
          limit: limit.toString()
        });
        
        const searchResponse = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${confluenceToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`Confluence Search Error: ${searchResponse.status} ${searchResponse.statusText}`, errorText);
          
          if (results.length === 0) {
            // Only fail if we have no results so far
            continue; // Try with other keywords instead of failing immediately
          }
          continue;
        }

        const searchData = await searchResponse.json();
        
        // Process and format the search results
        for (const item of searchData.results) {
          // Skip if we've already seen this item
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          
          results.push({
            id: item.id,
            type: item.type,
            title: item.title,
            url: `${confluenceBaseUrl}${item._links.webui}`,
            space: item.space?.name || 'Unknown Space',
            excerpt: item.body?.storage?.value 
              ? extractTextFromHTML(item.body.storage.value).substring(0, 300) + '...'
              : 'No content available',
            content: includeContent && item.body?.storage?.value 
              ? extractTextFromHTML(item.body.storage.value)
              : null
          });
        }
        
        // Limit the total results to avoid excess data
        if (results.length >= limit * 2) {
          break;
        }
      } catch (error) {
        console.error(`Error searching with term "${term}":`, error);
        // Continue with other keywords
      }
    }

    // If we have no results at all after trying all keywords
    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        keywords: searchTerms,
        resultsCount: 0,
        results: []
      });
    }

    // Sort results by relevance
    // This is a simple implementation that prioritizes results with search terms in the title
    results.sort((a, b) => {
      let aRelevance = 0;
      let bRelevance = 0;
      
      for (const term of searchTerms) {
        const termLower = term.toLowerCase();
        if (a.title.toLowerCase().includes(termLower)) aRelevance += 3;
        if (b.title.toLowerCase().includes(termLower)) bRelevance += 3;
        if (a.content && a.content.toLowerCase().includes(termLower)) aRelevance += 1;
        if (b.content && b.content.toLowerCase().includes(termLower)) bRelevance += 1;
      }
      
      return bRelevance - aRelevance;
    });

    return NextResponse.json({
      success: true,
      query,
      keywords: searchTerms,
      resultsCount: results.length,
      results: results.slice(0, limit) // Enforce the limit
    });
  } catch (error) {
    console.error('Error searching Confluence:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search Confluence',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to extract plain text from HTML content
function extractTextFromHTML(html: string): string {
  // Basic HTML tag removal - for production use consider using a proper HTML parser
  return html
    .replace(/<[^>]+>/g, ' ') // Replace HTML tags with spaces
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
} 