import React from 'react';
import EnhancedConfluenceSearch from '../components/knowledge/EnhancedConfluenceSearch';

export const metadata = {
  title: 'Enhanced Knowledge Search - AI Assistant',
  description: 'AI-powered semantic search for Confluence knowledge base',
};

export default function EnhancedKnowledgeSearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Knowledge Search</h1>
          <p className="mt-2 text-lg text-gray-600">
            Ask questions and get AI-powered semantic answers from your Confluence knowledge base
          </p>
        </div>
        
        <EnhancedConfluenceSearch />
      </div>
    </main>
  );
} 