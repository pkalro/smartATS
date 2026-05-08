"use client";

import { useState } from "react";
import { GitBranch, User, Wrench, MessageSquare } from "lucide-react";

const TABS = [
  { id: "pipeline", label: "Pipeline",  icon: GitBranch   },
  { id: "profile",  label: "Profile",   icon: User        },
  { id: "toolkit",  label: "Toolkit",   icon: Wrench      },
  { id: "activity", label: "Activity",  icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CandidateTabs({
  pipeline,
  profile,
  toolkit,
  activity,
  badges,
}: {
  pipeline: React.ReactNode;
  profile: React.ReactNode;
  toolkit: React.ReactNode;
  activity: React.ReactNode;
  /** Optional count badges per tab, e.g. { activity: 3 } */
  badges?: Partial<Record<TabId, number>>;
}) {
  const [active, setActive] = useState<TabId>("pipeline");

  const panels: Record<TabId, React.ReactNode> = { pipeline, profile, toolkit, activity };

  return (
    <div>
      <div className="sticky top-[49px] z-20 -mx-6 bg-white/95 backdrop-blur border-b border-slate-200 px-6 md:-mx-8 md:px-8 shadow-sm shadow-slate-900/[0.03]">
        <nav className="flex" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                active === id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badges?.[id] ? (
                <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none">
                  {badges[id]}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {TABS.map(({ id }) => (
        <div key={id} className={`pt-6 ${active === id ? "block" : "hidden"}`}>
          {panels[id]}
        </div>
      ))}
    </div>
  );
}
