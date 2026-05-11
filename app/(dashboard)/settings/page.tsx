import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUsage } from "@/lib/usage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingLinkForm } from "./booking-link-form";
import { RecruiterProfileForm } from "./recruiter-profile-form";
import { DangerZone } from "./danger-zone";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { bookingLink: true, name: true, email: true, company: true, industry: true, recruiterCategory: true },
    }),
    getUsage(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter profile</CardTitle>
          <CardDescription>Used to personalise AI outputs and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecruiterProfileForm
            initial={{
              company: user?.company ?? "",
              industry: user?.industry ?? "",
              recruiterCategory: user?.recruiterCategory ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking link</CardTitle>
          <CardDescription>Used in scheduling emails when you shortlist a candidate.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingLinkForm initial={user?.bookingLink ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user?.name ?? "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user?.email ?? "—"}</dd>
            <dt className="text-muted-foreground">AI calls this month</dt>
            <dd>{usage.count} / {usage.cap}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data &amp; account</CardTitle>
          <CardDescription>Export everything we hold on you, or delete your account permanently.</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone email={user?.email ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
