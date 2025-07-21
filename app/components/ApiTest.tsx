'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">AI System Status</h2>
      <p className="text-gray-700 mb-4">
        The AI integration system is ready for production use.
      </p>
      <Link
        href="/ai-test"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Open AI Testing Platform
      </Link>
    </div>
  );
} 