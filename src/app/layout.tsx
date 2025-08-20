import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "llmwrapper - AI Chat Assistant",
  description: "A modern AI chat assistant powered by multiple LLMs. Chat, create, and explore with AI.",
  keywords: ["llmwrapper", "AI", "Chat", "LLM", "Gemini", "Assistant", "Next.js", "TypeScript"],
  authors: [{ name: "llmwrapper Team" }],
  openGraph: {
    title: "llmwrapper - AI Chat Assistant",
    description: "A modern AI chat assistant powered by multiple LLMs",
    url: "https://llmwrapper.ai",
    siteName: "llmwrapper",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "llmwrapper - AI Chat Assistant",
    description: "A modern AI chat assistant powered by multiple LLMs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
