import type { SVGProps, ComponentType } from "react";
import { SparklesIcon }       from "./custom/sparkles";
import { LayoutDashboardIcon } from "./custom/layout-dashboard";
import { BriefcaseIcon }      from "./custom/briefcase";
import { UsersIcon }          from "./custom/users";
import { KanbanIcon }         from "./custom/kanban";
import { BarChartIcon }       from "./custom/bar-chart";
import { SettingsIcon }       from "./custom/settings";
import { LogOutIcon }         from "./custom/log-out";
import { PlusIcon }           from "./custom/plus";
import { SearchIcon }         from "./custom/search";
import { UploadIcon }         from "./custom/upload";
import { DownloadIcon }       from "./custom/download";
import { CopyIcon }           from "./custom/copy";
import { CheckIcon }          from "./custom/check";
import { XIcon }              from "./custom/x";
import { ChevronRightIcon }   from "./custom/chevron-right";
import { ChevronDownIcon }    from "./custom/chevron-down";
import { LoaderIcon }         from "./custom/loader";
import { MailIcon }           from "./custom/mail";
import { StarIcon }           from "./custom/star";
import { TrendingUpIcon }     from "./custom/trending-up";

export type IconName =
  | "sparkles"
  | "layout-dashboard"
  | "briefcase"
  | "users"
  | "kanban"
  | "bar-chart"
  | "settings"
  | "log-out"
  | "plus"
  | "search"
  | "upload"
  | "download"
  | "copy"
  | "check"
  | "x"
  | "chevron-right"
  | "chevron-down"
  | "loader"
  | "mail"
  | "star"
  | "trending-up";

export const iconRegistry: Record<IconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  "sparkles":         SparklesIcon,
  "layout-dashboard": LayoutDashboardIcon,
  "briefcase":        BriefcaseIcon,
  "users":            UsersIcon,
  "kanban":           KanbanIcon,
  "bar-chart":        BarChartIcon,
  "settings":         SettingsIcon,
  "log-out":          LogOutIcon,
  "plus":             PlusIcon,
  "search":           SearchIcon,
  "upload":           UploadIcon,
  "download":         DownloadIcon,
  "copy":             CopyIcon,
  "check":            CheckIcon,
  "x":                XIcon,
  "chevron-right":    ChevronRightIcon,
  "chevron-down":     ChevronDownIcon,
  "loader":           LoaderIcon,
  "mail":             MailIcon,
  "star":             StarIcon,
  "trending-up":      TrendingUpIcon,
};
