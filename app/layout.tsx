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
        <nav className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-xl font-bold">AI-Based</span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                      Home
                    </Link>
                    <Link href="/ai-test" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                      AI Testing Platform
                    </Link>
                    <Link href="/integrations-test" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                      Integrations Test
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
      </body>
    </html>
  );
}
