import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./lib/theme-provider";
import { intelOneDisplay } from "./lib/fonts";
import { HeaderWithNav } from "./components/header-with-nav";

export const metadata: Metadata = {
  title: "AI-Based System",
  description: "A Next.js application with AI integration",
  icons: {
    icon: "/images/ME-logo-stacked-black.svg",
    shortcut: "/images/ME-logo-stacked-black.svg",
    apple: "/images/ME-logo-stacked-black.svg",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/images/ME-logo-stacked-black.svg",
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={intelOneDisplay.variable}>
      <body className={`${intelOneDisplay.className} min-h-screen flex flex-col bg-white dark:bg-gray-900`}>
        <ThemeProvider>
          <HeaderWithNav />
          
          <main className="flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {children}
          </main>
          
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Mobileye. All rights reserved.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
