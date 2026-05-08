import { prisma } from "@/lib/db";
import { currentYearMonth } from "@/lib/utils";

const CAP = Number(process.env.USAGE_CAP_PER_MONTH ?? 100);
const WARN_BUFFER = Number(process.env.USAGE_WARN_BUFFER ?? 10);

export class UsageCapError extends Error {
  constructor() {
    super(
      `You've hit this month's AI usage cap of ${CAP} calls. It will reset on the 1st.`,
    );
    this.name = "UsageCapError";
  }
}

export async function getUsage(userId: string) {
  const yearMonth = currentYearMonth();
  const row = await prisma.usageMeter.findUnique({
    where: { userId_yearMonth: { userId, yearMonth } },
  });
  const count = row?.count ?? 0;
  return {
    count,
    cap: CAP,
    remaining: Math.max(0, CAP - count),
    warn: count >= CAP - WARN_BUFFER && count < CAP,
    exceeded: count >= CAP,
  };
}

/**
 * Atomically check cap and increment usage in a single transaction.
 * Prevents TOCTOU race where concurrent requests both pass the check.
 */
export async function incrementUsage(userId: string) {
  const yearMonth = currentYearMonth();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.usageMeter.findUnique({
      where: { userId_yearMonth: { userId, yearMonth } },
    });

    if (existing && existing.count >= CAP) throw new UsageCapError();

    await tx.usageMeter.upsert({
      where: { userId_yearMonth: { userId, yearMonth } },
      update: { count: { increment: 1 } },
      create: { userId, yearMonth, count: 1 },
    });
  });
}

// Pre-flight check (use before kicking off an AI call)
export async function assertUnderCap(userId: string) {
  const u = await getUsage(userId);
  if (u.exceeded) throw new UsageCapError();
  return u;
}
