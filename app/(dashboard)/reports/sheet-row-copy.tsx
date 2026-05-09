"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";

export function SheetRowCopy({ row }: { row: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        navigator.clipboard.writeText(row);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Icon name="check" size={3.5} className="text-green-600" /> : <Icon name="copy" size={3.5} />}
    </Button>
  );
}
