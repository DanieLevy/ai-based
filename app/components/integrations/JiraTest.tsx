'use client';

import { useState } from 'react';

export default function JiraTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/jira/test');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test Jira connection');
      }

      setResult(data);
    } catch (err) {
      console.error('Error testing Jira connection:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Jira Connection Test</h2>
      
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
              <li>Email: {result.user.emailAddress}</li>
              <li>Account ID: {result.user.accountId}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Projects:</h4>
            <p>Found {result.projects.count} projects</p>
            {result.projects.sampleNames.length > 0 && (
              <>
                <p className="text-sm">Sample projects:</p>
                <ul className="list-disc pl-5">
                  {result.projects.sampleNames.map((name: string, index: number) => (
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
          {result.details && (
            <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap max-h-40">
              {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
} 