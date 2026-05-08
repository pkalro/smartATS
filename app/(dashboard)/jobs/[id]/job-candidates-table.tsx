"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Pencil, Check, X, ChevronRight } from "lucide-react";
import { updateCandidateField } from "@/app/(dashboard)/candidates/[id]/profile-actions";
import { updateCandidateStatus } from "@/app/(dashboard)/candidates/actions";
import { STATUS_STYLES } from "@/lib/status-styles";
import type { CandidateStatus } from "@/lib/types";

const ALL_STATUSES: CandidateStatus[] = [
  "NEW", "SCREENING", "SHORTLISTED", "INTERVIEWING", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
];

type Candidate = {
  id: string;
  name: string | null;
  currentTitle: string | null;
  score: number | null;
  noticePeriod: string | null;
  currentSalary: string | null;
  status: string;
};

// ── Inline text cell ─────────────────────────────────────────────────────────
function EditableTextCell({
  candidateId,
  field,
  value,
  placeholder,
}: {
  candidateId: string;
  field: "noticePeriod" | "currentSalary";
  value: string | null;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saved, setSaved] = useState(value ?? "");
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    setSaved(trimmed);
    setEditing(false);
    start(() => updateCandidateField(candidateId, field, trimmed));
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="h-7 w-28 rounded-lg border border-blue-300 bg-white px-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder={placeholder}
        />
        <button type="button" onClick={save} className="text-emerald-600 hover:text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={cancel} className="text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group/cell flex items-center gap-1.5 cursor-pointer"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <span className={`text-sm ${saved ? "text-slate-700" : "text-slate-300"}`}>
        {saved || "—"}
      </span>
      <Pencil className="h-3 w-3 text-slate-300 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
    </div>
  );
}

// ── Status dropdown cell ──────────────────────────────────────────────────────
function StatusCell({ candidateId, status }: { candidateId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [, start] = useTransition();

  const handleChange = (newStatus: string) => {
    setCurrent(newStatus);
    start(() => updateCandidateStatus(candidateId, newStatus as CandidateStatus));
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        STATUS_STYLES[current] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export function JobCandidatesTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left">
            <th className="pb-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Name</th>
            <th className="pb-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Score</th>
            <th className="pb-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Notice <span className="normal-case font-normal text-slate-300">(click to edit)</span>
            </th>
            <th className="pb-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Salary <span className="normal-case font-normal text-slate-300">(click to edit)</span>
            </th>
            <th className="pb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {candidates.map((c) => (
            <tr key={c.id} className="group hover:bg-slate-50/70 transition-colors">
              {/* Name */}
              <td className="py-3 pr-4">
                <Link href={`/candidates/${c.id}`} className="font-semibold text-slate-900 hover:text-blue-700 transition-colors">
                  {c.name || "Unnamed"}
                </Link>
                {c.currentTitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{c.currentTitle}</p>
                )}
              </td>

              {/* Score */}
              <td className="py-3 pr-4">
                {c.score != null ? (
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${
                    c.score >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    c.score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-600 border-red-200"
                  }`}>
                    {c.score}
                  </span>
                ) : (
                  <span className="text-slate-300 text-sm">—</span>
                )}
              </td>

              {/* Notice — inline editable */}
              <td className="py-3 pr-4">
                <EditableTextCell
                  candidateId={c.id}
                  field="noticePeriod"
                  value={c.noticePeriod}
                  placeholder="e.g. 30 days"
                />
              </td>

              {/* Salary — inline editable */}
              <td className="py-3 pr-4">
                <EditableTextCell
                  candidateId={c.id}
                  field="currentSalary"
                  value={c.currentSalary}
                  placeholder="e.g. ₹18 LPA"
                />
              </td>

              {/* Status — inline dropdown */}
              <td className="py-3">
                <StatusCell candidateId={c.id} status={c.status} />
              </td>

              {/* Chevron link */}
              <td className="py-3 pl-2">
                <Link
                  href={`/candidates/${c.id}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
