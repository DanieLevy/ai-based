'use client';

import { useState } from 'react';

export default function ConfluenceTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/confluence/test');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test Confluence connection');
      }

      setResult(data);
    } catch (err) {
      console.error('Error testing Confluence connection:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Confluence Connection Test</h2>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 hover:bg-blue-700"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p className="whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          <h3 className="font-bold mb-2">Success!</h3>
          
          <div className="mb-3">
            <h4 className="font-medium">User Information:</h4>
            <ul className="list-disc pl-5">
              <li>Display Name: {result.user.displayName}</li>
              <li>Username: {result.user.username}</li>
              <li>Account ID: {result.user.accountId}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Spaces:</h4>
            <p>Found {result.spaces.count} spaces</p>
            {result.spaces.sampleNames.length > 0 && (
              <>
                <p className="text-sm">Sample spaces:</p>
                <ul className="list-disc pl-5">
                  {result.spaces.sampleNames.map((name: string, index: number) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
      
      {result && !result.success && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          <h3 className="font-bold">Connection Failed:</h3>
          <p>{result.error}</p>
          <div className="mt-3">
            <h4 className="font-medium">Possible solutions:</h4>
            <ul className="list-disc pl-5 text-sm">
              <li>Make sure your Confluence PAT (Personal Access Token) is valid and not expired</li>
              <li>Check that the token has the appropriate permissions</li>
              <li>Verify the Confluence URL is correct (should be something like <code>https://confluence.mobileye.com</code>)</li>
              <li>Try generating a new token if the current one doesn't work</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <p><strong>Note:</strong> For Confluence, the token should be used directly with a <code>Bearer</code> prefix in the Authorization header, not with Basic authentication.</p>
          </div>
          {result.details && (
            <>
              <h4 className="font-medium mt-3">Error details:</h4>
              <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap max-h-40 bg-red-50 p-2 rounded border border-red-200">
                {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
} 