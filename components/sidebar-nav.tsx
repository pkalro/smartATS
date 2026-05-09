"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import type { IconName } from "@/components/icons/registry";

const NAV_ITEMS: { href: string; icon: IconName; label: string }[] = [
  { href: "/dashboard",  icon: "layout-dashboard", label: "Dashboard" },
  { href: "/jobs",       icon: "briefcase",         label: "Jobs" },
  { href: "/candidates", icon: "users",             label: "Candidates" },
  { href: "/pipeline",   icon: "kanban",            label: "Pipeline" },
  { href: "/reports",    icon: "bar-chart",         label: "Reports" },
];

const ACCOUNT_ITEMS: { href: string; icon: IconName; label: string }[] = [
  { href: "/settings",   icon: "settings",          label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 space-y-0.5 p-3 pt-4">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} href={item.href} icon={item.icon} active={isActive(item.href)}>
          {item.label}
        </NavItem>
      ))}
      <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
      {ACCOUNT_ITEMS.map((item) => (
        <NavItem key={item.href} href={item.href} icon={item.icon} active={isActive(item.href)}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

function NavItem({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: IconName;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        name={icon}
        size={4}
        className={active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600 transition-colors"}
      />
      {children}
    </Link>
  );
}
