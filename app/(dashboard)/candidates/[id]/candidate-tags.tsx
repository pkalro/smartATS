"use client";

import { useState, useTransition, useRef } from "react";
import { X, Plus, Tag } from "lucide-react";
import { updateCandidateTags } from "./candidate-tag-actions";

export function CandidateTags({
  candidateId,
  initialTags,
}: {
  candidateId: string;
  initialTags: string[];
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const save = (next: string[]) => {
    start(async () => {
      await updateCandidateTags(candidateId, next);
    });
  };

  const addTag = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || tags.includes(t)) { setInput(""); return; }
    const next = [...tags, t];
    setTags(next);
    setInput("");
    save(next);
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    save(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No tags yet</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={pending}
              className="rounded-full hover:text-destructive transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
          }}
          placeholder="Add tag (e.g. java-backend, series-b)"
          className="h-7 flex-1 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={pending}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim() || pending}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs hover:bg-accent disabled:opacity-50"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tags help you surface this candidate for future roles. Press Enter or comma to add.
      </p>
    </div>
  );
}
