import { HeroHighlight, Highlight } from "./components/ui/hero-highlight";
import { FeatureCard } from "./components/ui/feature-card";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <HeroHighlight containerClassName="h-[85vh] max-h-[800px]">
        <div className="flex flex-col items-center text-center px-6 md:px-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 dark:text-white mb-6">
            AI-Based <Highlight>System</Highlight>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light mb-10">
            A Next.js application with advanced AI integration capabilities, 
            designed to <Highlight className="dark:from-blue-500 dark:to-indigo-500 from-blue-300 to-indigo-300">connect with knowledge sources</Highlight> and provide intelligent responses.
          </p>
          
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 w-full max-w-6xl mt-12">
            <FeatureCard 
              title="AI Integration"
              description="Connect to multiple AI models with an elegant interface for natural language processing and intelligent responses."
            />
            
            <FeatureCard 
              title="Knowledge Search"
              description="Access information across your knowledge base with intelligent semantic search powered by advanced AI models."
            />
          </div>
        </div>
      </HeroHighlight>

      <section className="w-full max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-medium text-center mb-12 text-gray-900 dark:text-white">
          Features & <Highlight>Capabilities</Highlight>
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Not feautre card method but other nice cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Advanced AI Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect to multiple AI models with an elegant interface for natural language processing and intelligent responses.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Knowledge Search
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access information across your knowledge base with intelligent semantic search powered by advanced AI models.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Semantic Search
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Go beyond keyword matching with AI-powered semantic search that understands context and meaning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
