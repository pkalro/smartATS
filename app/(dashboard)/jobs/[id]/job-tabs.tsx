"use client";

import { useState } from "react";
import { Settings2, Search, Users, TrendingUp } from "lucide-react";

// Details tab first — job setup context is always the starting point
const TABS = [
  { id: "details",    label: "Details",    icon: Settings2   },
  { id: "sourcing",   label: "Sourcing",   icon: Search      },
  { id: "candidates", label: "Candidates", icon: Users       },
  { id: "market",     label: "Market",     icon: TrendingUp  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function JobTabs({
  defaultTab = "details",
  sourcing,
  candidates,
  market,
  details,
}: {
  defaultTab?: TabId;
  sourcing: React.ReactNode;
  candidates: React.ReactNode;
  market: React.ReactNode;
  details: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>(defaultTab);
  const panels: Record<TabId, React.ReactNode> = { sourcing, candidates, market, details };

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-[calc(3.5rem+49px)] md:top-[49px] z-20 -mx-4 md:-mx-8 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 shadow-sm shadow-slate-900/[0.03]">
        <nav className="flex gap-0" role="tablist">
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
