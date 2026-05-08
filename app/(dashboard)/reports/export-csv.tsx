"use client";

import { Button } from "@/components/ui/button";

export interface ExportRow {
  candidateName: string;
  email: string;
  phone: string;
  jobTitle: string;
  source: string;
  applicationStatus: string;
  score: number | null;
  currentTitle: string;
  currentCompany: string;
  location: string;
  yearsExperience: number | null;
  noticePeriod: string;
  currentSalary: string;
  expectedSalary: string;
  createdAt: string;
}

function escapeField(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: ExportRow[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Job Title",
    "Source",
    "Application Status",
    "Score",
    "Current Title",
    "Current Company",
    "Location",
    "Years Experience",
    "Notice Period",
    "Current Salary",
    "Expected Salary",
    "Created At",
  ];

  const dataRows = rows.map((r) =>
    [
      r.candidateName,
      r.email,
      r.phone,
      r.jobTitle,
      r.source,
      r.applicationStatus,
      r.score != null ? String(r.score) : "",
      r.currentTitle,
      r.currentCompany,
      r.location,
      r.yearsExperience != null ? String(r.yearsExperience) : "",
      r.noticePeriod,
      r.currentSalary,
      r.expectedSalary,
      r.createdAt,
    ]
      .map(escapeField)
      .join(",")
  );

  return [headers.join(","), ...dataRows].join("\n");
}

function buildTsv(rows: ExportRow[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Job Title",
    "Source",
    "Application Status",
    "Score",
    "Current Title",
    "Current Company",
    "Location",
    "Years Experience",
    "Notice Period",
    "Current Salary",
    "Expected Salary",
    "Created At",
  ];

  const dataRows = rows.map((r) =>
    [
      r.candidateName,
      r.email,
      r.phone,
      r.jobTitle,
      r.source,
      r.applicationStatus,
      r.score != null ? String(r.score) : "",
      r.currentTitle,
      r.currentCompany,
      r.location,
      r.yearsExperience != null ? String(r.yearsExperience) : "",
      r.noticePeriod,
      r.currentSalary,
      r.expectedSalary,
      r.createdAt,
    ].join("\t")
  );

  return [headers.join("\t"), ...dataRows].join("\n");
}

interface ExportCsvButtonProps {
  rows: ExportRow[];
  filename: string;
}

export function ExportCsvButton({ rows, filename }: ExportCsvButtonProps) {
  function handleClick() {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button onClick={handleClick} variant="default">
      Download CSV
    </Button>
  );
}

interface CopyTsvButtonProps {
  rows: ExportRow[];
}

export function CopyTsvButton({ rows }: CopyTsvButtonProps) {
  function handleClick() {
    const tsv = buildTsv(rows);
    navigator.clipboard.writeText(tsv).catch(console.error);
  }

  return (
    <Button onClick={handleClick} variant="outline">
      Copy as TSV
    </Button>
  );
}
