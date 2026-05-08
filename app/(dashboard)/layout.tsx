import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Sparkles, FileText, Users, Kanban,
  BarChart2, LogOut, Settings, LayoutDashboard,
} from "lucide-react";
import { UsageBannerAsync } from "@/components/usage-banner-async";

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-white border-r border-slate-200/80 shadow-sm shadow-slate-900/[0.04]">

        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-md shadow-blue-200">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">Smart ATS</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>
          <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavItem>
          <NavItem href="/jobs"      icon={<FileText className="h-4 w-4" />}>Jobs</NavItem>
          <NavItem href="/candidates" icon={<Users className="h-4 w-4" />}>Candidates</NavItem>
          <NavItem href="/pipeline"  icon={<Kanban className="h-4 w-4" />}>Pipeline</NavItem>
          <NavItem href="/reports"   icon={<BarChart2 className="h-4 w-4" />}>Reports</NavItem>

          <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
          <NavItem href="/settings"  icon={<Settings className="h-4 w-4" />}>Settings</NavItem>
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="h-8 w-8 rounded-full ring-2 ring-white shadow-sm" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{session.user.name}</p>
              <p className="truncate text-[11px] text-slate-400">{session.user.email}</p>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button
                type="submit"
                title="Sign out"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col min-w-0">
        <Suspense fallback={null}>
          <UsageBannerAsync userId={session.user.id} />
        </Suspense>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
      {children}
    </Link>
  );
}
