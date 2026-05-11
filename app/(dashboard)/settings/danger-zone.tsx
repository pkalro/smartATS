"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { deleteMyAccount } from "./actions";

export function DangerZone({ email }: { email: string }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    const fd = new FormData();
    fd.set("confirmEmail", confirmEmail);
    start(async () => {
      const r = await deleteMyAccount(fd);
      if (r && "error" in r) setError(r.error ?? "Could not delete account.");
    });
  }

  return (
    <div className="space-y-3">
      {/* Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Export your data</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Download a JSON file with your account, jobs, candidates, applications and usage history.
          </p>
        </div>
        <a
          href="/api/account/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Download export
        </a>
      </div>

      <div className="border-t border-slate-100" />

      {/* Delete */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Delete account</p>
            <p className="text-xs text-red-700/80 mt-0.5 leading-relaxed">
              Permanently deletes your account, all jobs, candidates, applications, feedback, communications
              and usage history. <strong>This cannot be undone.</strong> Encrypted backups are purged within
              30 days.
            </p>
          </div>
        </div>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-white border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-red-900">
              Type your email <span className="font-mono">{email}</span> to confirm:
            </label>
            <input
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={email}
              autoComplete="off"
              className="w-full h-9 rounded-lg border border-red-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
            {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending || confirmEmail.toLowerCase() !== email.toLowerCase()}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Deleting…" : "Permanently delete"}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirmEmail(""); setError(null); }}
                disabled={pending}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
