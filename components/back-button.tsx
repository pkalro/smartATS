"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Navigates to the previous page in browser history.
 * Falls back to `href` if history is empty (e.g. direct link).
 */
export function BackButton({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  const router = useRouter();

  function handleClick() {
    // If there's history, go back; otherwise fall through to href
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="-ml-2 gap-1.5 text-slate-500 hover:text-slate-800"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
