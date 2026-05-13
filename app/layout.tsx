import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import { PostHogPageView } from "@/components/posthog-pageview";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "Optichire",
  description: "AI-powered recruiting for sharp hirers. Score resumes, generate screening kits, and close roles faster.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <PostHogProvider>
          <PostHogPageView />
          {children}
          <CookieConsent />
        </PostHogProvider>
      </body>
    </html>
  );
}
