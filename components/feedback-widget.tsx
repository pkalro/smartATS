"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Icon } from "@/components/icons/icon";

type Step = "closed" | "open" | "sent";

export function FeedbackWidget() {
  const posthog = usePostHog();
  const [step, setStep]     = useState<Step>("closed");
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText]     = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit() {
    if (!posthog) return;
    setSending(true);
    posthog.capture("feedback_submitted", {
      rating,
      message: text.trim(),
    });
    setSending(false);
    setStep("sent");
    // reset after 3s so widget can be used again
    setTimeout(() => { setStep("closed"); setRating(null); setText(""); }, 3000);
  }

  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("open")}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Give feedback"
      >
        <Icon name="sparkles" size={3.5} />
        Feedback
      </button>
    );
  }

  if (step === "sent") {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl p-5 w-72 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <p className="font-semibold text-slate-800">Thanks for your feedback!</p>
        <p className="text-sm text-slate-500 mt-1">It genuinely helps us improve.</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl w-72 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="font-semibold text-slate-800 text-sm">Share feedback</span>
        <button
          onClick={() => setStep("closed")}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Icon name="x" size={3.5} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Rating */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">How&apos;s your experience?</p>
          <div className="flex gap-2">
            {(["😞", "😐", "🙂", "😄", "🤩"] as const).map((emoji, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className={`flex-1 py-1.5 text-lg rounded-lg border transition-all ${
                  rating === i + 1
                    ? "border-blue-400 bg-blue-50 scale-110"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">What could be better? (optional)</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us what you think…"
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating == null || sending}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:from-blue-700 hover:to-violet-700 transition-all"
        >
          {sending ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </div>
  );
}
