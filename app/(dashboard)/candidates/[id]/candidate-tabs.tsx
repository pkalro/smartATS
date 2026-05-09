"use client";

import { useState } from "react";
import { GitBranch, User, Wrench, MessageSquare } from "lucide-react";
import { Icon } from "@/components/icons/icon";

const TABS = [
  { id: "pipeline", label: "Pipeline"  },
  { id: "profile",  label: "Profile"   },
  { id: "toolkit",  label: "Toolkit"   },
  { id: "activity", label: "Activity"  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabIcon({ id }: { id: TabId }) {
  // These 4 are kept from lucide — no direct custom equivalent
  if (id === "pipeline") return <GitBranch className="h-4 w-4" />;
  if (id === "profile")  return <User className="h-4 w-4" />;
  if (id === "toolkit")  return <Wrench className="h-4 w-4" />;
  if (id === "activity") return <MessageSquare className="h-4 w-4" />;
  return null;
}

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
      <div className="sticky top-[calc(3.5rem+49px)] md:top-[49px] z-20 -mx-4 md:-mx-8 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 shadow-sm shadow-slate-900/[0.03]">
        <nav className="flex overflow-x-auto scrollbar-none" role="tablist">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => setActive(id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                active === id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <TabIcon id={id} />
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
