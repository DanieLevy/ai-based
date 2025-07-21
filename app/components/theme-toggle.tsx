"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/lib/theme-provider";
import { cn } from "@/app/lib/utils";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder with same dimensions
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "flex items-center justify-center rounded-md p-2 transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <FiMoon size={20} className="text-gray-800" />
      ) : (
        <FiSun size={20} className="text-white" />
      )}
    </button>
  );
} 