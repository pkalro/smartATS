"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCandidateField } from "./profile-actions";

// Single inline-editable field row
export function EditableInfoRow({
  candidateId,
  icon,
  label,
  field,
  value,
}: {
  candidateId: string;
  icon: React.ReactNode;
  label: string;
  field: string;
  value: string | null | undefined;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saved, setSaved] = useState(value ?? "");
  const [pending, start] = useTransition();

  const save = () => {
    start(async () => {
      await updateCandidateField(candidateId, field, draft.trim());
      setSaved(draft.trim());
      setEditing(false);
    });
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-2.5 group">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-0.5">{label}</p>
        {editing ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              className="h-7 flex-1 rounded-lg border border-blue-300 bg-white px-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Button size="sm" disabled={pending} onClick={save}
              className="h-7 w-7 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm">
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel} className="h-7 w-7 p-0 rounded-lg">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-slate-800 truncate">{saved || <span className="text-slate-300">—</span>}</p>
            <button
              type="button"
              onClick={() => { setDraft(saved); setEditing(true); }}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-blue-600"
              title={`Edit ${label}`}
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
