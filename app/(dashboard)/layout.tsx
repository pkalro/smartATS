import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icons/icon";
import { LogoOptichire } from "@/components/brand/logos";
import { UsageBannerAsync } from "@/components/usage-banner-async";
import { SidebarNav } from "@/components/sidebar-nav";
import { PostHogIdentify } from "@/components/posthog-identify";
import { FeedbackWidget } from "@/components/feedback-widget";
import { ManageCookiesLink } from "@/components/cookie-consent";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const avatar = session.user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={session.user.image} alt="" className="h-8 w-8 rounded-full ring-2 ring-white shadow-sm" />
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white shadow-sm">
      {initials}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PostHogIdentify
        userId={session.user.id}
        name={session.user.name}
        email={session.user.email}
      />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-white border-r border-slate-200/80 shadow-sm shadow-slate-900/[0.04]">

        {/* Logo */}
        <div className="flex h-16 items-center px-5 border-b border-slate-100">
          <Link href="/dashboard">
            <LogoOptichire size="md" />
          </Link>
        </div>

        {/* Nav */}
        <SidebarNav />

        {/* User footer */}
        <div className="border-t border-slate-100 p-3 space-y-1">
          {/* User identity row */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            {avatar}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{session.user.name}</p>
              <p className="truncate text-[11px] text-slate-400">Recruiter</p>
            </div>
          </div>

          {/* Sign out row — always visible */}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Icon name="log-out" size={4} />
              Sign out
            </button>
          </form>

          {/* Legal links */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pt-1 text-[10px] text-slate-400">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/dpa" className="hover:text-slate-700">DPA</Link>
            <ManageCookiesLink className="hover:text-slate-700" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="flex md:hidden items-center justify-between px-4 h-14 bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0">
          <Link href="/dashboard"><LogoOptichire size="sm" /></Link>
          <div className="flex items-center gap-1">
            <Link href="/settings" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
              <Icon name="settings" size={4} />
            </Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" title="Sign out" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <Icon name="log-out" size={4} />
              </button>
            </form>
            {avatar}
          </div>
        </header>

        <Suspense fallback={null}>
          <UsageBannerAsync userId={session.user.id} />
        </Suspense>

        {/* Page content — extra bottom padding on mobile for the nav bar */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <FeedbackWidget />

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around px-1 h-16 safe-bottom">
        <MobileNavItem href="/dashboard"  icon={<Icon name="layout-dashboard" size={5} />} label="Home" />
        <MobileNavItem href="/jobs"       icon={<Icon name="briefcase" size={5} />}       label="Jobs" />
        <MobileNavItem href="/candidates" icon={<Icon name="users" size={5} />}           label="People" />
        <MobileNavItem href="/pipeline"   icon={<Icon name="kanban" size={5} />}          label="Pipeline" />
        <MobileNavItem href="/reports"    icon={<Icon name="bar-chart" size={5} />}       label="Reports" />
      </nav>
    </div>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 flex-1 py-2 text-slate-400 hover:text-blue-600 transition-colors"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
