"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/icon";

export type AppScoreEvent = {
  score: number | null;
  jobTitle: string;
  jobId: string;
};

/** Listen for score changes dispatched by JobApplications when the tab changes. */
export function HeaderScoreBadge({ initial }: { initial: number | null }) {
  const [score, setScore] = useState<number | null>(initial);

  useEffect(() => {
    const handler = (e: Event) => {
      const { score: s } = (e as CustomEvent<AppScoreEvent>).detail;
      setScore(s);
    };
    window.addEventListener("candidate:app-selected", handler);
    return () => window.removeEventListener("candidate:app-selected", handler);
  }, []);

  if (score == null) return null;

  return (
    <span className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
      score >= 75 ? "bg-emerald-100 text-emerald-700" :
      score >= 50 ? "bg-amber-100 text-amber-700" :
      "bg-red-100 text-red-600"
    }`}>
      <Icon name="star" size={3} />{score}
    </span>
  );
}

/** Dispatch from JobApplications when selection changes. */
export function dispatchAppSelected(score: number | null, jobTitle: string, jobId: string) {
  window.dispatchEvent(
    new CustomEvent<AppScoreEvent>("candidate:app-selected", { detail: { score, jobTitle, jobId } })
  );
}
