import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  FileSignature,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTaxhub } from "../use-taxhub";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/inbox", label: "Requests", icon: Inbox, exact: false },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen, exact: false },
  { to: "/sources", label: "Sources", icon: Library, exact: false },
  { to: "/drafts", label: "Drafts", icon: FileSignature, exact: false },
  { to: "/activity", label: "Activity", icon: History, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
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
        <aside className="shrink-0 border-b border-border-default bg-sidebar lg:w-60 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:py-4">
            <div className="min-w-0">
              <p className="font-serif text-base leading-tight font-medium text-text-primary">
                TaxHub
              </p>
              <p className="truncate text-xs text-text-secondary">{workspace.shortName}</p>
            </div>
            <div className="flex items-center gap-2 lg:mt-4">
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded-full bg-action-primary text-xs font-semibold text-action-primary-fg"
              >
                {user.initials}
              </span>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-xs font-medium">{user.name}</p>
                <p className="truncate text-[11px] text-text-secondary">{user.role}</p>
              </div>
            </div>
          </div>

          <nav aria-label="Main" className="px-2 pb-3">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to} className="shrink-0">
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-text-primary"
                          : "text-text-secondary hover:bg-sidebar-accent hover:text-text-primary",
                      )}
                    >
                      <Icon aria-hidden className="size-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.to === "/inbox" && reviewCount > 0 ? (
                        <span className="ml-auto rounded-sm bg-human-review-required-bg px-1.5 py-0.5 text-[11px] font-semibold text-human-review-required">
                          {reviewCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <p className="hidden px-4 pb-4 text-[11px] leading-relaxed text-text-tertiary lg:block">
            Demonstration workspace. All firm, client and document data is fictional. Practice-system
            integrations are mocked.
          </p>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}