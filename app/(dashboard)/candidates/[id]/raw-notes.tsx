"use client";

import { useState, useTransition, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, StickyNote } from "lucide-react";
import { saveRawNotes } from "../actions";

export function RawNotes({ candidateId, initial }: { candidateId: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = notes !== initial;
  const savedRef = useRef(initial);

  function doSave(val: string) {
    if (val === savedRef.current) return;
    setSaved(false);
    start(async () => {
      await saveRawNotes(candidateId, val);
      savedRef.current = val;
      setSaved(true);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Recruiter rough notes</span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        onBlur={(e) => doSave(e.target.value)}
        placeholder="Jot anything down — call observations, vibe check, things to follow up on, links, etc."
        rows={4}
        className="text-sm"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={pending || !dirty}
          onClick={() => doSave(notes)}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </Button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
        {dirty && !saved && <span className="text-xs text-muted-foreground">Auto-saves on blur</span>}
      </div>
    </div>
  );
}
