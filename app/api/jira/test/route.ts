import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL;
    const jiraUsername = process.env.JIRA_USERNAME;
    const jiraToken = process.env.JIRA_API_TOKEN;
    
    if (!jiraBaseUrl || !jiraUsername || !jiraToken) {
      return NextResponse.json({
        success: false,
        error: 'Jira credentials are not configured correctly in .env.local'
      }, { status: 500 });
    }

    // Test Jira connection by getting current user info
    const response = await fetch(`${jiraBaseUrl}/rest/api/2/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraUsername}:${jiraToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Jira: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const userData = await response.json();
    
    // Also get a list of projects to test more functionality
    const projectsResponse = await fetch(`${jiraBaseUrl}/rest/api/2/project`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraUsername}:${jiraToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let projectsData = [];
    let projectCount = 0;
    
    if (projectsResponse.ok) {
      projectsData = await projectsResponse.json();
      projectCount = projectsData.length;
    }
    
    return NextResponse.json({
      success: true,
      user: {
        displayName: userData.displayName,
        emailAddress: userData.emailAddress,
        accountId: userData.accountId
      },
      projects: {
        count: projectCount,
        sampleNames: projectsData.slice(0, 5).map((p: any) => p.name)
      }
    });
  } catch (error) {
    console.error('Error testing Jira connection:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test Jira connection',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 