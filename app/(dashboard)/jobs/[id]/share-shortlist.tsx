"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, ExternalLink, Trash2 } from "lucide-react";
import { createShareLink, revokeShareLink } from "./share-actions";

type ShareLink = {
  id: string;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
  _count: { feedback: number };
};

export function ShareShortlist({
  jobId,
  existingLinks,
}: {
  jobId: string;
  existingLinks: ShareLink[];
}) {
  const [links, setLinks] = useState<ShareLink[]>(existingLinks);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleCreate = () => {
    start(async () => {
      const { token } = await createShareLink(jobId, 7);
      setLinks((prev) => [
        {
          id: token,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          _count: { feedback: 0 },
        },
        ...prev,
      ]);
    });
  };

  const handleRevoke = (linkId: string) => {
    start(async () => {
      await revokeShareLink(linkId, jobId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    });
  };

  const copy = (token: string) => {
    navigator.clipboard.writeText(`${baseUrl}/share/shortlist/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Share a read-only view of shortlisted candidates with your hiring manager.
        </p>
        <Button size="sm" variant="outline" disabled={pending} onClick={handleCreate}>
          <Share2 className="h-3.5 w-3.5" /> Generate link
        </Button>
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => {
            const url = `${baseUrl}/share/shortlist/${link.token}`;
            const expired = link.expiresAt && new Date(link.expiresAt) < new Date();
            return (
              <div key={link.id} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${expired ? "opacity-50" : ""}`}>
                <span className="flex-1 truncate font-mono text-xs text-muted-foreground">{url}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {link._count.feedback} response{link._count.feedback !== 1 ? "s" : ""}
                </span>
                <Button size="sm" variant="ghost" onClick={() => copy(link.token)} className="shrink-0">
                  {copied === link.token ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <a href={url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" className="shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => handleRevoke(link.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
