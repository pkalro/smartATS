import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

export const metadata: Metadata = {
  title: "Smart ATS",
  description: "AI-powered ATS for recruiters",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
