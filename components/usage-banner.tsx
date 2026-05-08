import { AlertTriangle, Zap } from "lucide-react";

type Usage = {
  count: number;
  cap: number;
  remaining: number;
  warn: boolean;
  exceeded: boolean;
};

export function UsageBanner({ usage }: { usage: Usage }) {
  if (!usage.warn && !usage.exceeded) return null;

  if (usage.exceeded) {
    return (
      <div className="flex items-center gap-2.5 border-b border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-700">
        <Zap className="h-4 w-4 shrink-0" />
        You&apos;ve reached this month&apos;s cap of {usage.cap} AI calls. Resets on the 1st.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      Heads up — only {usage.remaining} AI call{usage.remaining !== 1 ? "s" : ""} left this month (of {usage.cap}).
    </div>
  );
}
