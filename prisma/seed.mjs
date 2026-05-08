// Seed sample data for local dev. Run with: node prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEV_USER_ID = "dev-user";

const SAMPLE_JD = `Senior Backend Engineer — Payments

We're a series-B fintech building infrastructure for cross-border B2B payments.
Looking for a backend engineer with strong distributed-systems instincts.

Must have:
- 5+ years building production backend services
- Deep experience with Go or Rust (we use Go)
- Postgres at scale: query optimization, schema design, online migrations
- Track record working on payments, ledgers, or financial systems

Nice to have:
- Kafka or other event streaming
- gRPC, Protobuf
- AWS (we run on EKS)

Comp: $180K-$240K base + equity + 0.05-0.15%
Hybrid in NYC (3 days in office)`;

const SAMPLE_BOOLEAN =
  '("backend engineer" OR "software engineer") AND (Go OR Golang) AND (payments OR ledger OR fintech) AND Postgres NOT (junior OR intern)';

const SAMPLE_PERSONA = `An experienced backend engineer (5-10 years) who's spent meaningful time at a fintech, payments processor, or any company where money moved through their code. They reach for Go by default and have war stories about online schema migrations on multi-billion-row Postgres tables. They're motivated by problems where correctness matters more than speed of shipping — they've debugged enough double-charge bugs to take consistency seriously. They're comfortable in NYC, open to hybrid, and value an environment where engineering decisions get to be load-bearing rather than rubber-stamped by product.`;

async function main() {
  console.log("Seeding dev user...");
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: {
      id: DEV_USER_ID,
      name: "Dev Recruiter",
      email: "dev@local.test",
      image: null,
      bookingLink: "https://calendly.com/dev-recruiter/30min",
    },
  });

  console.log("Seeding sample job...");
  const existingJob = await prisma.job.findFirst({
    where: { userId: DEV_USER_ID, title: { contains: "Backend" } },
  });
  const job = existingJob
    ? existingJob
    : await prisma.job.create({
        data: {
          userId: DEV_USER_ID,
          title: "Senior Backend Engineer — Payments",
          rawJD: SAMPLE_JD,
          booleanString: SAMPLE_BOOLEAN,
          booleanLinkedIn: SAMPLE_BOOLEAN,
          booleanNaukri: SAMPLE_BOOLEAN,
          booleanXRay: 'site:linkedin.com/in/ ("backend engineer" OR "software engineer") AND (Go OR Golang) AND (payments OR fintech)',
          targetCompanies: JSON.stringify(["Stripe", "Plaid", "Brex", "Ramp", "Adyen", "Marqeta"]),
          altDesignations: JSON.stringify(["Platform Engineer", "Infrastructure Engineer", "Software Engineer", "SDE", "Senior SWE"]),
          nichePlatforms: JSON.stringify(["Wellfound", "HackerNews (Who is Hiring)", "Fintech Slack communities", "Golang Bridge Slack"]),
          personaSummary: SAMPLE_PERSONA,
          interviewRounds: JSON.stringify(["Recruiter Screen", "Technical Take-home", "System Design", "Founder Call"]),
          minExperience: 5,
          maxExperience: 10,
          locationPref: "NYC Hybrid",
          status: "ACTIVE",
        },
      });

  console.log("Seeding sample candidates...");
  const existingCount = await prisma.candidate.count({
    where: { userId: DEV_USER_ID },
  });
  if (existingCount === 0) {
    await prisma.candidate.createMany({
      data: [
        {
          userId: DEV_USER_ID,
          jobId: job.id,
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "+1 415 555 0142",
          currentTitle: "Staff Backend Engineer",
          currentCompany: "Stripe",
          yearsExperience: 8,
          skills: JSON.stringify([
            "Go",
            "Postgres",
            "gRPC",
            "Kafka",
            "AWS",
            "Distributed systems",
            "Payments",
          ]),
          noticePeriod: "30 days",
          currentSalary: "$215K base + 0.08% equity",
          expectedSalary: "$240K base + meaningful equity",
          location: "Brooklyn, NY",
          score: 92,
          scoreRationale:
            "Strong match — 8 years backend, deep Go + Postgres, currently shipping payments infra at Stripe. Salary expectations within band, location is on-site compatible.",
          rawSource:
            "Resume: Priya Sharma — Staff Backend Engineer at Stripe (4 yrs). Previously SDE-III at Amazon Payments (3 yrs). Built ledger reconciliation pipeline processing $4B/yr...",
          sourceType: "resume",
          status: "SHORTLISTED",
        },
        {
          userId: DEV_USER_ID,
          jobId: job.id,
          name: "Marcus Chen",
          email: "mchen@example.com",
          phone: "+1 212 555 0188",
          currentTitle: "Senior Software Engineer",
          currentCompany: "Plaid",
          yearsExperience: 6,
          skills: JSON.stringify([
            "Go",
            "Postgres",
            "Kubernetes",
            "Terraform",
            "Banking APIs",
          ]),
          noticePeriod: "2 weeks",
          currentSalary: "$195K + 0.04%",
          expectedSalary: "$220K+",
          location: "NYC",
          score: 78,
          scoreRationale:
            "Solid mid-senior fit. Go + Postgres + financial APIs experience. Slightly less ledger-specific work than ideal but can ramp quickly.",
          rawSource:
            "Call notes: Marcus has been at Plaid 3 years, works on the Auth product. Background at Goldman Sachs prior. Looking to move because mgmt change. Open to NYC hybrid.",
          sourceType: "notes",
          status: "SCREENED",
        },
        {
          userId: DEV_USER_ID,
          jobId: job.id,
          name: "Jordan Bell",
          email: "jordan.bell@example.com",
          phone: null,
          currentTitle: "Backend Engineer II",
          currentCompany: "DoorDash",
          yearsExperience: 4,
          skills: JSON.stringify([
            "Python",
            "Django",
            "Postgres",
            "Redis",
            "Celery",
          ]),
          noticePeriod: "1 month",
          currentSalary: "$165K + RSUs",
          expectedSalary: "$180K",
          location: "Remote (Austin)",
          score: 42,
          scoreRationale:
            "Mismatch on stack (Python/Django, no Go) and seniority (4 yrs vs 5+ required). Domain (food delivery) isn't payments-adjacent.",
          rawSource:
            "Resume: Jordan Bell — Backend Engineer II at DoorDash. Python/Django stack, microservices for restaurant onboarding...",
          sourceType: "resume",
          status: "REJECTED",
        },
      ],
    });
  } else {
    console.log(`  (${existingCount} candidates already exist — skipping)`);
  }

  console.log("\n✅ Seed complete.");
  console.log(`   Dev user ID: ${DEV_USER_ID}`);
  console.log("   Email: dev@local.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
