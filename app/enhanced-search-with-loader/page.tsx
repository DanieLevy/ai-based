import React from 'react';
import EnhancedConfluenceSearchWithLoader from '../components/knowledge/EnhancedConfluenceSearchWithLoader';

export const metadata = {
  title: 'Enhanced Knowledge Search with Loader - AI Assistant',
  description: 'AI-powered semantic search for Confluence knowledge base with visual loading indicators',
};

export default function EnhancedSearchWithLoaderPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Knowledge Search</h1>
          <p className="mt-2 text-lg text-gray-600">
            AI-powered semantic search with visual loading indicators
          </p>
        </div>
        
        <EnhancedConfluenceSearchWithLoader />
      </div>
    </main>
  );
} 