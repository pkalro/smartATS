"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icons/icon";
import { generateLinkedInPostAction } from "../actions";

const POST_TYPES = [
  { value: "short-casual", label: "Short & Casual" },
  { value: "long-professional", label: "Long & Professional" },
  { value: "bullet-style", label: "Bullet Style" },
  { value: "story-style", label: "Story Style" },
  { value: "jd-format", label: "Structured JD" },
];

export function GenerateJD({ jobId, initialJD }: { jobId: string; initialJD: string | null }) {
  const [pending, start] = useTransition();
  const [post, setPost] = useState(initialJD ?? "");
  const [postType, setPostType] = useState("jd-format");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {POST_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPostType(t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                postType === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/40 hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => {
            setError(null);
            start(async () => {
              const r = await generateLinkedInPostAction(jobId, postType);
              if ("error" in r) setError(r.error ?? null);
              else if ("post" in r) setPost(r.post ?? "");
            });
          }}
        >
          {pending ? (
            <><Icon name="loader" size={4} className="animate-spin" /> Generating…</>
          ) : (
            <><Icon name="sparkles" size={4} /> {post ? "Regenerate" : "Generate post"}</>
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {post && (
        <div className="space-y-2">
          <Textarea
            value={post}
            onChange={(e) => setPost(e.target.value)}
            rows={16}
            className="font-mono text-sm"
          />
          <CopyButton text={post} label="Copy post" />
        </div>
      )}
    </div>
  );
}
