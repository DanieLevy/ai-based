import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const confluenceBaseUrl = process.env.CONFLUENCE_BASE_URL;
    const confluenceUsername = process.env.CONFLUENCE_USERNAME;
    const confluenceToken = process.env.CONFLUENCE_API_TOKEN;
    
    if (!confluenceBaseUrl || !confluenceUsername || !confluenceToken) {
      return NextResponse.json({
        success: false,
        error: 'Confluence credentials are not configured correctly in .env.local'
      }, { status: 500 });
    }

    // Test Confluence connection by getting current user info
    // Use Bearer token authentication for Personal Access Token
    const userResponse = await fetch(`${confluenceBaseUrl}/rest/api/latest/user/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${confluenceToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`Confluence API Error: ${userResponse.status} ${userResponse.statusText}`, errorText);
      
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Confluence: ${userResponse.status} ${userResponse.statusText}`,
        details: errorText
      }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    
    // Also get a list of spaces to test more functionality
    const spacesResponse = await fetch(`${confluenceBaseUrl}/rest/api/latest/space?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${confluenceToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let spacesData = { results: [] };
    
    if (spacesResponse.ok) {
      spacesData = await spacesResponse.json();
    } else {
      console.warn(`Failed to fetch Confluence spaces: ${spacesResponse.status} ${spacesResponse.statusText}`);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        displayName: userData.displayName,
        username: userData.username || userData.accountId,
        accountId: userData.accountId
      },
      spaces: {
        count: spacesData.results?.length || 0,
        sampleNames: spacesData.results?.map((s: any) => s.name) || []
      }
    });
  } catch (error) {
    console.error('Error testing Confluence connection:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test Confluence connection',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 