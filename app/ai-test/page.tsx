'use client';

import { useState } from 'react';
import ApiTester from '@/app/components/ai/ApiTester';
import LogViewer from '@/app/components/ai/LogViewer';

export default function AITestPage() {
  const [activeTab, setActiveTab] = useState<'tester' | 'logs'>('tester');
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Sofia AI Testing Platform</h1>
          <p className="text-gray-600 mt-2">Test different AI models and compare performance</p>
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-6 py-2 text-sm font-medium rounded-l-md ${
                activeTab === 'tester'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('tester')}
            >
              Model Tester
            </button>
            <button
              type="button"
              className={`px-6 py-2 text-sm font-medium rounded-r-md ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              Logs & Analytics
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'tester' ? (
            <div className="p-6">
              <ApiTester />
            </div>
          ) : (
            <div className="p-6">
              <LogViewer />
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Based on Sofia AI platform. Test and compare different models for optimal performance and cost.
          </p>
        </div>
      </div>
    </div>
  );
} 