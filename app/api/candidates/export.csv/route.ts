import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseSkills } from "@/lib/skills";
import { NextResponse } from "next/server";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const candidates = await prisma.candidate.findMany({
    where: { userId: session.user.id },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    include: { job: { select: { title: true } } },
  });

  const headers = [
    "name",
    "email",
    "phone",
    "currentTitle",
    "currentCompany",
    "yearsExperience",
    "skills",
    "noticePeriod",
    "currentSalary",
    "expectedSalary",
    "location",
    "score",
    "scoreRationale",
    "status",
    "job",
    "createdAt",
  ];

  const rows = candidates.map((c) =>
    [
      c.name,
      c.email,
      c.phone,
      c.currentTitle,
      c.currentCompany,
      c.yearsExperience,
      parseSkills(c.skills).join("; "),
      c.noticePeriod,
      c.currentSalary,
      c.expectedSalary,
      c.location,
      c.score,
      c.scoreRationale,
      c.status,
      c.job?.title ?? "",
      c.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
