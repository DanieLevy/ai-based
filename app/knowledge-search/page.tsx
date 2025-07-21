import React from 'react';
import ConfluenceSearch from '../components/knowledge/ConfluenceSearch';

export const metadata = {
  title: 'Knowledge Search - AI Assistant',
  description: 'Search Confluence knowledge base using AI',
};

export default function KnowledgeSearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Confluence Knowledge Search</h1>
          <p className="mt-2 text-lg text-gray-600">
            Ask questions and get AI-powered answers based on your Confluence knowledge base
          </p>
        </div>
        
        <ConfluenceSearch />
      </div>
    </main>
  );
} 