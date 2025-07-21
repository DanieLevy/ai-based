import Image from "next/image";
import Link from "next/link";
import ApiTest from "./components/ApiTest";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="text-3xl font-bold text-center">Sofia AI Integration</h1>
        
        <p className="text-center max-w-md">
          This application demonstrates integration with Sofia AI's
          OpenAI-compatible API using different models for various tasks.
        </p>
        
        <div className="w-full max-w-xl">
          <ApiTest />
        </div>
        
        <div className="mt-6">
          <Link 
            href="/ai-test" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Open Full Testing Platform
          </Link>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link 
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/api/ai/models"
            target="_blank"
          >
            View Available Models
          </Link>
        </div>
      </main>
    </div>
  );
}
