'use client';

import JiraTest from '../components/integrations/JiraTest';
import ConfluenceTest from '../components/integrations/ConfluenceTest';

export default function IntegrationsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Integration Connection Tests</h1>
          <p className="text-gray-600 mt-2">Test connections to Jira and Confluence using your .env.local credentials</p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <JiraTest />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <ConfluenceTest />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8 p-6">
          <h2 className="text-xl font-bold mb-4">Credentials Configuration</h2>
          <p className="mb-2">These tests use the following environment variables:</p>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Jira Configuration</h3>
            <ul className="list-disc pl-5 mb-3">
              <li><code className="bg-gray-100 px-1 rounded">JIRA_BASE_URL</code> - Base URL of your Jira instance</li>
              <li><code className="bg-gray-100 px-1 rounded">JIRA_USERNAME</code> - Your Jira username</li>
              <li><code className="bg-gray-100 px-1 rounded">JIRA_API_TOKEN</code> - Your Jira API token</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Confluence Configuration</h3>
            <ul className="list-disc pl-5 mb-3">
              <li><code className="bg-gray-100 px-1 rounded">CONFLUENCE_BASE_URL</code> - Base URL of your Confluence instance</li>
              <li><code className="bg-gray-100 px-1 rounded">CONFLUENCE_USERNAME</code> - Your Confluence username</li>
              <li><code className="bg-gray-100 px-1 rounded">CONFLUENCE_API_TOKEN</code> - Your Confluence API token</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-blue-800 text-sm">
              <h4 className="font-medium">Confluence Token Tips:</h4>
              <ul className="list-disc pl-5">
                <li>Generate a Personal Access Token (PAT) from: <code>https://confluence.mobileye.com/plugins/personalaccesstokens/usertokens.action</code></li>
                <li>Ensure the token has the following permissions: <code>read:confluence-content.all</code></li>
                <li>Copy the token string directly into the <code>CONFLUENCE_API_TOKEN</code> environment variable</li>
                <li>For Confluence, the token is used with Bearer authentication (not Basic auth)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 