"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Icon } from "@/components/icons/icon";

const TABS = [
  { id: "details",    label: "Details"    },
  { id: "sourcing",   label: "Sourcing"   },
  { id: "candidates", label: "Candidates" },
  { id: "market",     label: "Market"     },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabIcon({ id }: { id: TabId }) {
  if (id === "details")    return <Settings2 className="h-4 w-4" />;
  if (id === "sourcing")   return <Icon name="search" size={4} />;
  if (id === "candidates") return <Icon name="users" size={4} />;
  if (id === "market")     return <Icon name="trending-up" size={4} />;
  return null;
}

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
