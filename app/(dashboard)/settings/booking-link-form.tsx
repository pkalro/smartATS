"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { saveBookingLink } from "@/app/(dashboard)/candidates/[id]/coordinator-actions";

export function BookingLinkForm({ initial }: { initial: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [value, setValue] = useState(initial);

  return (
    <form
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          const r = await saveBookingLink(fd);
          if ("error" in r) setError(r.error ?? null);
          else setSaved(true);
        });
      }}
      className="space-y-3"
    >
      <div className="space-y-2">
        <Label htmlFor="bookingLink">Calendly / cal.com URL</Label>
        <Input
          id="bookingLink"
          name="bookingLink"
          type="url"
          placeholder="https://calendly.com/your-handle/30min"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
