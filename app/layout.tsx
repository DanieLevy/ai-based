import "./globals.css";
import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "AI-Based System",
  description: "A Next.js application with Sofia AI integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
              <span className="font-semibold text-xl tracking-tight">AI Dashboard</span>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow">
                <Link href="/" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Home
                </Link>
                <Link href="/chat-test" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Chat Test
                </Link>
                <Link href="/vision-test" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Vision Test
                </Link>
                <Link href="/integrations-test" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Integrations Test
                </Link>
                <Link href="/knowledge-search" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Knowledge Search
                </Link>
                <Link href="/enhanced-knowledge-search" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Enhanced Search
                </Link>
                <Link href="/enhanced-search-with-loader" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
                  Search with Loader
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
      </body>
    </html>
  );
}
