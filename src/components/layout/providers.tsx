"use client";

import { ThemeProvider } from "next-themes";
import { SearchProvider } from "@/components/search/search-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SearchProvider>{children}</SearchProvider>
    </ThemeProvider>
  );
}
