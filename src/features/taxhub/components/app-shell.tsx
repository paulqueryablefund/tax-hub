import { Link, useRouterState } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen,
  Compass,
  FileSignature,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { lockSite } from "@/lib/gate.functions";
import { useTaxhub } from "../use-taxhub";
import { TourProvider, useTour } from "../tour/tour-provider";
import { WORKFLOW_ORDER } from "../tour/tour-content";
import { Announcer } from "./announcer";
import { RoleSwitcher } from "./role-switcher";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true, tour: "nav.overview" },
  { to: "/inbox", label: "Requests", icon: Inbox, exact: false, tour: "nav.inbox" },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen, exact: false, tour: "nav.knowledge" },
  { to: "/sources", label: "Sources", icon: Library, exact: false, tour: "nav.sources" },
  { to: "/drafts", label: "Drafts", icon: FileSignature, exact: false, tour: "nav.drafts" },
  { to: "/activity", label: "Activity", icon: History, exact: false, tour: "nav.activity" },
  { to: "/settings", label: "Settings", icon: Settings, exact: false, tour: "nav.settings" },
  { to: "/tour", label: "Guided tour", icon: Compass, exact: false, tour: "nav.tour" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Announcer>
      <TourProvider>
        <AppChrome>{children}</AppChrome>
      </TourProvider>
    </Announcer>
  );
}

function AppChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { requests, workspace, currentUser } = useTaxhub();
  const user = currentUser;
  const reviewCount = requests.filter((r) => r.status === "ready_for_review").length;

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:w-64 [&_:focus-visible]:outline-[var(--sidebar-ring)]">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:py-6">
            <div className="min-w-0">
              <p className="font-serif text-[1.0625rem] leading-tight font-medium tracking-[-0.01em] text-sidebar-foreground">
                TaxHub
              </p>
              <p className="truncate text-[11px] tracking-[0.04em] text-sidebar-muted uppercase">
                {workspace.shortName}
              </p>
            </div>
            <div className="flex items-center gap-2.5 lg:mt-6">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-sidebar-elevated text-[11px] font-semibold tracking-[0.04em] text-sidebar-foreground ring-1 ring-sidebar-border"
              >
                {user.initials}
              </span>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-[11px] text-sidebar-muted">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="mx-5 hidden h-px bg-sidebar-border lg:block" />

          <nav aria-label="Main" className="px-3 pb-4 lg:pt-4">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to} className="shrink-0">
                    <Link
                      to={item.to}
                      data-tour={item.tour}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-sm py-2.5 pr-2.5 pl-3.5 text-[13px] transition-colors duration-150",
                        "before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-opacity",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-foreground before:bg-sidebar-primary before:opacity-100"
                          : "text-sidebar-muted before:opacity-0 hover:bg-sidebar-elevated hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon aria-hidden className="size-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                      {item.to === "/inbox" && reviewCount > 0 ? (
                        <span
                          data-tour="inbox.nav-badge"
                          className="ml-auto rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sidebar-primary-foreground"
                        >
                          {reviewCount}
                        </span>
                      ) : null}
                      {item.to === "/tour" ? <TourNavBadge /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <p className="hidden px-5 pb-5 text-[11px] leading-relaxed text-sidebar-muted lg:block">
            Demonstration workspace. All firm, client and document data is fictional. Practice-system
            integrations are mocked.
          </p>

          <div className="mt-auto border-t border-sidebar-border pt-4">
            <RoleSwitcher compact />
            <div className="px-3 pb-5">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Derived, never stored: how many of the nine area tours are complete. */
function SignOutButton() {
  const router = useRouter();
  const lock = useServerFn(lockSite);
  return (
    <button
      type="button"
      onClick={async () => {
        await lock({ data: undefined });
        await router.invalidate();
        await router.navigate({ to: "/unlock" });
      }}
      className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-xs text-sidebar-muted transition-colors hover:bg-sidebar-elevated hover:text-sidebar-foreground"
    >
      <LogOut aria-hidden className="size-3.5 shrink-0" />
      <span>Sign out of the workspace</span>
    </button>
  );
}

function TourNavBadge() {
  const { state, hydrated } = useTour();
  if (!hydrated) return null;
  const completed = WORKFLOW_ORDER.filter(
    (area) => state.areas[area]?.tourStatus === "completed",
  ).length;
  if (completed === 0) return null;
  return (
    <span className="ml-auto rounded-full bg-sidebar-elevated px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sidebar-muted">
      {completed}/{WORKFLOW_ORDER.length}
    </span>
  );
}