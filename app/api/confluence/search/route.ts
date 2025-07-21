import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, limit = 5 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
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

    // Search Confluence content using CQL (Confluence Query Language)
    const searchResponse = await fetch(
      `${confluenceBaseUrl}/rest/api/content/search?cql=text~"${encodeURIComponent(query)}"&expand=body.storage,space&limit=${limit}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${confluenceToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`Confluence Search Error: ${searchResponse.status} ${searchResponse.statusText}`, errorText);
      
      return NextResponse.json({
        success: false,
        error: `Failed to search Confluence: ${searchResponse.status} ${searchResponse.statusText}`,
        details: errorText
      }, { status: searchResponse.status });
    }

    const searchData = await searchResponse.json();
    
    // Process and format the search results
    const results = searchData.results.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      url: `${confluenceBaseUrl}${item._links.webui}`,
      space: item.space?.name || 'Unknown Space',
      excerpt: item.body?.storage?.value 
        ? extractTextFromHTML(item.body.storage.value).substring(0, 300) + '...'
        : 'No content available',
      content: item.body?.storage?.value 
        ? extractTextFromHTML(item.body.storage.value)
        : 'No content available'
    }));

    return NextResponse.json({
      success: true,
      query,
      resultsCount: searchData.results.length,
      totalResultsCount: searchData.size,
      results
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