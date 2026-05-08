"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, MessageSquare, MoreHorizontal, Trash2, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp } from "lucide-react";
import { logCommunication, deleteCommunication } from "./communication-actions";

type Comm = {
  id: string;
  channel: string;
  direction: string;
  subject: string | null;
  body: string | null;
  occurredAt: Date;
  applicationId: string | null;
};

type Application = { id: string; jobTitle: string };

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  EMAIL:    <Mail className="h-3.5 w-3.5" />,
  WHATSAPP: <MessageSquare className="h-3.5 w-3.5" />,
  CALL:     <Phone className="h-3.5 w-3.5" />,
  OTHER:    <MoreHorizontal className="h-3.5 w-3.5" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  EMAIL:    "bg-blue-50 text-blue-700",
  WHATSAPP: "bg-green-50 text-green-700",
  CALL:     "bg-purple-50 text-purple-700",
  OTHER:    "bg-slate-50 text-slate-600",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

export function Communications({
  candidateId,
  communications,
  applications,
}: {
  candidateId: string;
  communications: Comm[];
  applications: Application[];
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [channel, setChannel] = useState("EMAIL");
  const [direction, setDirection] = useState("OUT");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));

  const handleAdd = () => {
    const fd = new FormData();
    fd.set("candidateId", candidateId);
    fd.set("channel", channel);
    fd.set("direction", direction);
    fd.set("subject", subject);
    fd.set("body", body);
    fd.set("applicationId", applicationId);
    fd.set("occurredAt", occurredAt);
    start(async () => {
      await logCommunication(fd);
      setAdding(false);
      setSubject(""); setBody("");
    });
  };

  const handleDelete = (id: string) => {
    start(async () => { await deleteCommunication(id, candidateId); });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        <span>
          Communications
          {communications.length > 0 && (
            <span className="ml-1 font-normal text-muted-foreground">({communications.length})</span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <>
          {communications.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground">No communications logged yet.</p>
          )}

          {/* Log list */}
          {communications.length > 0 && (
            <div className="space-y-2">
              {communications.map((c) => (
                <div key={c.id} className="flex gap-3 rounded-md border p-3 text-sm">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${CHANNEL_COLOR[c.channel] ?? "bg-muted text-muted-foreground"}`}>
                    {CHANNEL_ICON[c.channel] ?? <MoreHorizontal className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.channel}</span>
                      {c.direction === "OUT"
                        ? <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                        : <ArrowDownLeft className="h-3 w-3 text-blue-500" />}
                      <span className="text-xs text-muted-foreground">{formatDate(c.occurredAt)}</span>
                    </div>
                    {c.subject && <div className="font-medium text-muted-foreground truncate">{c.subject}</div>}
                    {c.body && <p className="text-muted-foreground mt-0.5 line-clamp-2">{c.body}</p>}
                    {c.applicationId && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {applications.find((a) => a.id === c.applicationId)?.jobTitle ?? ""}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => handleDelete(c.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {adding ? (
            <div className="space-y-3 rounded-md border p-3 bg-muted/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Channel</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["EMAIL", "WHATSAPP", "CALL", "OTHER"].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannel(ch)}
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          channel === ch
                            ? `${CHANNEL_COLOR[ch]} border-current`
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {CHANNEL_ICON[ch]}{ch.charAt(0) + ch.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Direction</label>
                  <div className="flex gap-1.5">
                    {[
                      { val: "OUT", label: "Outbound", icon: <ArrowUpRight className="h-3 w-3" /> },
                      { val: "IN",  label: "Inbound",  icon: <ArrowDownLeft className="h-3 w-3" /> },
                    ].map(({ val, label, icon }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDirection(val)}
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          direction === val
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">When</label>
                  <input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                {applications.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Job (optional)</label>
                    <select
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="">Any</option>
                      {applications.map((a) => (
                        <option key={a.id} value={a.id}>{a.jobTitle}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Subject / topic</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Interview invite sent"
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did you say / hear?"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" disabled={pending} onClick={handleAdd}>Log</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> Log touchpoint
            </Button>
          )}
        </>
      )}
    </div>
  );
}
