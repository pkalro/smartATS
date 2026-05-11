/**
 * Personal data export — DPDP Act §11 (right to access) and portability.
 *
 * Returns a single JSON document with the signed-in user's account record,
 * all jobs, candidates, applications, feedback, communications, tags, and
 * usage history. Streamed as an attachment so the user can save it.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      bookingLink: true,
      company: true,
      industry: true,
      recruiterCategory: true,
    },
  });

  const [jobs, candidates, usage] = await Promise.all([
    prisma.job.findMany({
      where: { userId },
      include: {
        candidateApplications: {
          include: {
            roundFeedback: true,
            communications: true,
          },
        },
      },
    }),
    prisma.candidate.findMany({
      where: { userId },
      include: {
        applications: true,
        communications: true,
        emailDrafts: true,
      },
    }),
    prisma.usageMeter.findMany({ where: { userId } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    notice:
      "This export contains your personal data and the candidate data you uploaded to Smart ATS. " +
      "You are responsible for keeping it secure and handling it in line with applicable privacy law.",
    user,
    jobs,
    candidates,
    usage,
  };

  const json = JSON.stringify(payload, null, 2);
  const filename = `smartats-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
