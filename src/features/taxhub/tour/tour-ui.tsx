import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  findAnchor,
  prefersReducedMotion,
  rectOf,
  scrollAnchorIntoView,
  waitForAnchor,
  type AnchorRect,
} from "./anchor";
import {
  AREA_GLOSS,
  AREA_NAMES,
  MICROCOPY,
  POPUP_CHROME,
  REPLAY_CLOSING,
  SKIP_REASON_TEXT,
  WELCOME,
  WELCOME_RETURNING,
  WORKFLOW_CHAIN,
  WORKFLOW_ORDER,
  AREA_POPUPS,
  ALL_AREAS,
  type AreaId,
} from "./tour-content";
import { pathnameOf, useTour, type RunStep } from "./tour-provider";

/* ------------------------------------------------------------------ *
 * The single layer mounted by the provider.
 * ------------------------------------------------------------------ */

export function TourLayer(props: {
  advanceArea: () => void;
  exitReplay: (destination: "restore" | "hub") => void;
  finishArea: (completed: boolean) => void;
}) {
  const { welcome, popupArea, run } = useTour();
  return (
    <>
      {welcome ? <WelcomeModal variant={welcome} /> : null}
      {!welcome && popupArea ? <AreaPopup area={popupArea} /> : null}
      {run ? <RunLayer {...props} /> : null}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Welcome modal (§1)
 * ------------------------------------------------------------------ */

function WelcomeModal({ variant }: { variant: "first" | "returning" }) {
  const { closeWelcome, startFull, startReplay } = useTour();
  const [dontShow, setDontShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDialogKeys(ref, () => closeWelcome(dontShow));

  const first = variant === "first";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-text-primary/25 p-4 sm:items-center">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-welcome-title"
        className="w-full max-w-3xl rounded-md border border-border-default bg-surface p-5 shadow-lg sm:p-6"
      >
        <h2 id="tour-welcome-title" className="type-page-title text-text-primary">
          {first ? WELCOME.title : WELCOME_RETURNING.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-primary">
          {first ? WELCOME.explanation : WELCOME_RETURNING.explanation}
        </p>

        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_CHAIN.map((link, i) => (
            <li
              key={link.label}
              className="rounded-sm border border-border-subtle bg-subtle px-3 py-2"
            >
              <p className="text-sm font-medium">
                <span className="type-data mr-1.5 text-text-tertiary">{i + 1}</span>
                {link.label}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">{link.gloss}</p>
            </li>
          ))}
        </ol>
        {first ? (
          <p className="mt-2 text-xs text-text-secondary">{WELCOME.chainCaption}</p>
        ) : null}

        {first ? (
          <div className="mt-5">
            <p className="type-label mb-2">Areas</p>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {ALL_AREAS.map((area) => (
                <div key={area}>
                  <dt className="text-sm font-medium">{AREA_NAMES[area]}</dt>
                  <dd className="text-xs text-text-secondary">{AREA_GLOSS[area]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <p className="mt-5 rounded-sm border border-border-subtle bg-subtle px-3 py-2 text-sm text-text-primary">
          {first ? WELCOME.trust : WELCOME_RETURNING.trust}
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          {first ? WELCOME.demoData : WELCOME_RETURNING.demoData}
        </p>

        {first ? (
          <div className="mt-4 flex items-start gap-2">
            <Checkbox
              id="tour-welcome-dismiss"
              checked={dontShow}
              onCheckedChange={(v) => setDontShow(v === true)}
            />
            <label htmlFor="tour-welcome-dismiss" className="text-sm">
              {WELCOME.checkbox}
              <span className="mt-0.5 block text-xs text-text-secondary">
                {WELCOME.checkboxHelp}
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              closeWelcome(dontShow);
              startFull();
            }}
          >
            {WELCOME.buttons.primary}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              closeWelcome(dontShow);
              startReplay();
            }}
          >
            {WELCOME.buttons.secondary}
          </Button>
          <Button variant="ghost" onClick={() => closeWelcome(dontShow)}>
            {first ? WELCOME.buttons.tertiary : WELCOME_RETURNING.close}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Per-area first-visit popup (§2)
 * ------------------------------------------------------------------ */

function AreaPopup({ area }: { area: AreaId }) {
  const { closePopup, startArea } = useTour();
  const [dontShow, setDontShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDialogKeys(ref, () => closePopup(dontShow));
  const copy = AREA_POPUPS[area];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div
        ref={ref}
        role="dialog"
        aria-labelledby={`tour-popup-${area}`}
        className="pointer-events-auto w-full max-w-lg rounded-md border border-border-default bg-surface p-4 shadow-lg"
      >
        <h2 id={`tour-popup-${area}`} className="type-section-title text-text-primary">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-primary">{copy.body}</p>
        <p className="mt-2 text-sm text-text-primary">
          <span className="font-medium">What to notice: </span>
          {copy.notice}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Checkbox
            id={`tour-popup-dismiss-${area}`}
            checked={dontShow}
            onCheckedChange={(v) => setDontShow(v === true)}
          />
          <label htmlFor={`tour-popup-dismiss-${area}`} className="text-sm">
            {POPUP_CHROME.checkbox(AREA_NAMES[area])}
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              closePopup(dontShow);
              startArea(area);
            }}
          >
            {POPUP_CHROME.primary}
          </Button>
          <Button size="sm" variant="outline" onClick={() => closePopup(dontShow)}>
            {POPUP_CHROME.secondary}
          </Button>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">{POPUP_CHROME.footer}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The running tour / replay
 * ------------------------------------------------------------------ */

function RunLayer({
  advanceArea,
  exitReplay,
}: {
  advanceArea: () => void;
  exitReplay: (destination: "restore" | "hub") => void;
  finishArea: (completed: boolean) => void;
}) {
  const tour = useTour();
  const run = tour.run!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduced = useReducedMotion();
  const step: RunStep | undefined = run.steps[run.idx];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<AnchorRect | null>(null);
  const [skipping, setSkipping] = useState(false);

  const isReplay = run.mode === "replay";
  const onRoute = !step?.target || pathnameOf(step.target) === pathname;

  /* full tour rolls straight into the next area — the label already said so */
  useEffect(() => {
    if (run.mode === "full" && run.phase === "area-done") advanceArea();
  }, [run.mode, run.phase, advanceArea]);

  /* resolve the anchor for the active step */
  useEffect(() => {
    setAnchorEl(null);
    setRect(null);
    setSkipping(false);
    if (run.phase !== "running" || !step || !onRoute) return;
    let cancelled = false;
    const waiter = waitForAnchor(step.anchor, 1600);
    waiter.promise.then((found) => {
      if (cancelled) return;
      if (!found) {
        setSkipping(true);
        return;
      }
      const scrolled = scrollAnchorIntoView(found, reduced);
      const settle = scrolled && !reduced ? 300 : 0;
      window.setTimeout(() => {
        if (cancelled) return;
        setAnchorEl(found);
        setRect(rectOf(found));
      }, settle);
    });
    return () => {
      cancelled = true;
      waiter.cancel();
    };
  }, [run.phase, run.idx, step, onRoute, reduced]);

  /* keep the highlight glued to the anchor */
  useEffect(() => {
    if (!anchorEl) return;
    let frame = 0;
    const track = () => {
      if (!document.contains(anchorEl)) {
        setAnchorEl(null);
        setRect(null);
        setSkipping(true);
        return;
      }
      setRect(rectOf(anchorEl));
      frame = window.requestAnimationFrame(track);
    };
    frame = window.requestAnimationFrame(track);
    return () => window.cancelAnimationFrame(frame);
  }, [anchorEl]);

  /* honest skip note, then the step leaves the runtime sequence (P3) */
  useEffect(() => {
    if (!skipping) return;
    const t = window.setTimeout(() => tour.dropCurrentStep(), 4000);
    return () => window.clearTimeout(t);
  }, [skipping, tour]);

  const leave = useCallback(() => {
    if (isReplay) exitReplay("hub");
    else tour.exit();
  }, [isReplay, exitReplay, tour]);

  /* keyboard: Esc leaves, arrows move */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        leave();
      } else if (e.key === "ArrowRight") {
        tour.next();
      } else if (e.key === "ArrowLeft") {
        tour.back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leave, tour]);

  /* clicking outside pauses the run rather than killing it */
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (run.paused) return;
      const target = e.target as Node | null;
      if (target && panelRef.current?.contains(target)) return;
      tour.togglePause();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [run.paused, tour]);

  /* replay auto-advance */
  useEffect(() => {
    if (!isReplay || run.manual || run.paused || run.phase !== "running") return;
    if (!anchorEl && !skipping) return;
    const dwell = (step?.dwell ?? 18) * 1000;
    const t = window.setTimeout(() => tour.next(), dwell);
    return () => window.clearTimeout(t);
  }, [isReplay, run.manual, run.paused, run.phase, run.idx, anchorEl, skipping, step, tour]);

  const total = run.steps.length;
  const n = run.idx + 1;

  if (run.phase === "area-done" && run.mode === "area") {
    return <AreaDoneCard skipped={run.skipped} area={run.areaSeq[run.areaIdx]} />;
  }
  if (run.phase === "tour-done") return <FullDoneCard />;
  if (run.phase === "replay-done") return <ReplayClosingCard exitReplay={exitReplay} />;
  if (run.phase !== "running" || !step) return <LoadingHint />;

  const areaName = isReplay ? null : AREA_NAMES[run.areaSeq[run.areaIdx]];
  const lastStep = run.idx === total - 1;
  const advanceLabel = isReplay
    ? MICROCOPY.next
    : lastStep
      ? run.mode === "full"
        ? MICROCOPY.nextArea
        : MICROCOPY.finish
      : MICROCOPY.next;
  const leaveLabel = isReplay
    ? MICROCOPY.exitReplay
    : run.mode === "full"
      ? MICROCOPY.endTour
      : MICROCOPY.skipArea;
  const counter = isReplay
    ? MICROCOPY.beatCounter(n, total)
    : MICROCOPY.stepCounter(n, total);

  return (
    <>
      <Spotlight rect={rect} reduced={reduced} />
      <div className="sr-only" role="status" aria-live="polite">
        {counter}
        {step.title ? `: ${step.title}` : ""}
      </div>
      <TourPanel
        panelRef={panelRef}
        rect={rect}
        fixedBottom={isReplay}
        reduced={reduced}
        onLeave={leave}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="type-label">{counter}</p>
            {run.mode === "full" && areaName ? (
              <p className="text-[11px] text-text-tertiary">
                {MICROCOPY.fullTourLine(areaName, run.areaIdx + 1)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={leave}
            aria-label={MICROCOPY.close}
            className="rounded-sm p-1 text-text-secondary hover:text-text-primary"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {skipping ? (
          <div className="mt-2 rounded-sm border border-border-subtle bg-subtle px-3 py-2">
            <p className="text-sm font-medium">{MICROCOPY.skipNote.title(step.title || "")}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {MICROCOPY.skipNote.body(
                step.points,
                step.skipReason
                  ? SKIP_REASON_TEXT[step.skipReason].replace(/^…/, "")
                  : MICROCOPY.skipNote.defaultReason,
              )}
            </p>
          </div>
        ) : (
          <>
            {step.title ? (
              <h2 className="mt-1 type-section-title text-text-primary">{step.title}</h2>
            ) : null}
            <p className="mt-1.5 text-sm leading-relaxed text-text-primary">{step.text}</p>
          </>
        )}

        {run.idx === 0 && !isReplay && isNarrow() ? (
          <p className="mt-2 text-xs text-text-secondary">{MICROCOPY.mobileNote}</p>
        ) : null}
        {run.idx === 0 && isReplay && isNarrow() ? (
          <p className="mt-2 text-xs text-text-secondary">{MICROCOPY.mobileReplay}</p>
        ) : null}

        {run.paused ? (
          <p className="mt-2 text-xs text-text-secondary">
            {MICROCOPY.resume} — the tour is paused while you work.
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {run.idx > 0 || (run.mode === "full" && run.areaIdx > 0) ? (
            <Button size="sm" variant="outline" onClick={tour.back}>
              {MICROCOPY.back}
            </Button>
          ) : null}
          {isReplay ? (
            <Button size="sm" variant="outline" onClick={tour.togglePause}>
              {run.paused ? MICROCOPY.resume : MICROCOPY.pause}
            </Button>
          ) : null}
          <Button size="sm" onClick={tour.next}>
            {advanceLabel}
          </Button>
          <Button size="sm" variant="ghost" onClick={leave}>
            {leaveLabel}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-text-tertiary">{MICROCOPY.keyboardHint}</p>
        {run.idx === 0 ? (
          <p className="text-[11px] text-text-tertiary">{MICROCOPY.keepWorking}</p>
        ) : null}
      </TourPanel>
    </>
  );
}

function LoadingHint() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-sm border border-border-default bg-surface px-3 py-2 text-xs text-text-secondary shadow">
      <span role="status">Finding the part of the screen this step is about…</span>
    </div>
  );
}

/** Pointer-transparent scrim: the user can keep working underneath it. */
function Spotlight({ rect, reduced }: { rect: AnchorRect | null; reduced: boolean }) {
  if (!rect) return null;
  const pad = 6;
  const box = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
  const scrim = "pointer-events-none fixed z-30 bg-text-primary/20";
  return (
    <>
      <div className={scrim} style={{ top: 0, left: 0, right: 0, height: Math.max(box.top, 0) }} />
      <div
        className={scrim}
        style={{ top: box.top + box.height, left: 0, right: 0, bottom: 0 }}
      />
      <div
        className={scrim}
        style={{ top: box.top, left: 0, width: Math.max(box.left, 0), height: box.height }}
      />
      <div
        className={scrim}
        style={{ top: box.top, left: box.left + box.width, right: 0, height: box.height }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed z-30 rounded-sm ring-2 ring-action-primary",
          reduced ? "" : "transition-all duration-200",
        )}
        style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
      />
    </>
  );
}

/** The panel never covers its own anchor and never blocks input. */
function TourPanel({
  rect,
  fixedBottom,
  reduced,
  panelRef,
  onLeave,
  children,
}: {
  rect: AnchorRect | null;
  fixedBottom: boolean;
  reduced: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onLeave: () => void;
  children: React.ReactNode;
}) {
  useFocusTrap(panelRef);
  const style = useMemo(() => {
    if (fixedBottom || !rect) return undefined;
    const width = Math.min(380, window.innerWidth - 24);
    const below = rect.top + rect.height + 12;
    const fitsBelow = below + 240 < window.innerHeight;
    const left = Math.min(
      Math.max(rect.left, 12),
      Math.max(window.innerWidth - width - 12, 12),
    );
    return fitsBelow
      ? { top: below, left, width }
      : { bottom: Math.max(window.innerHeight - rect.top + 12, 12), left, width };
  }, [rect, fixedBottom]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Guided tour"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onLeave();
        }
      }}
      className={cn(
        "z-40 rounded-md border border-border-default bg-surface p-4 shadow-lg",
        reduced ? "" : "transition-[top,left,bottom] duration-200",
        fixedBottom
          ? "fixed inset-x-0 bottom-0 mx-auto max-w-3xl"
          : rect
            ? "fixed"
            : "fixed bottom-4 left-1/2 w-[min(380px,calc(100vw-24px))] -translate-x-1/2",
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Completion cards (§5.4, §4 closing card)
 * ------------------------------------------------------------------ */

function CardShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div
        ref={ref}
        role="dialog"
        className="pointer-events-auto w-full max-w-lg rounded-md border border-border-default bg-surface p-4 shadow-lg"
      >
        {children}
      </div>
    </div>
  );
}

function AreaDoneCard({ area, skipped }: { area: AreaId; skipped: string[] }) {
  const tour = useTour();
  const idx = WORKFLOW_ORDER.indexOf(area);
  const nextArea = idx >= 0 && idx + 1 < WORKFLOW_ORDER.length ? WORKFLOW_ORDER[idx + 1] : null;
  return (
    <CardShell>
      <h2 className="type-section-title">{MICROCOPY.areaDone.title(AREA_NAMES[area])}</h2>
      {nextArea ? (
        <p className="mt-1.5 text-sm text-text-primary">
          {MICROCOPY.areaDone.body(AREA_NAMES[nextArea])}
        </p>
      ) : null}
      {skipped.length ? (
        <p className="mt-2 text-xs text-text-secondary">
          {MICROCOPY.skippedSummary(skipped.length)}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {nextArea ? (
          <Button size="sm" onClick={() => tour.startArea(nextArea)}>
            {MICROCOPY.areaDone.go(AREA_NAMES[nextArea])}
          </Button>
        ) : null}
        <HubButton label={MICROCOPY.areaDone.hub} />
        <Button size="sm" variant="ghost" onClick={tour.exit}>
          {MICROCOPY.close}
        </Button>
      </div>
    </CardShell>
  );
}

function FullDoneCard() {
  const tour = useTour();
  return (
    <CardShell>
      <h2 className="type-section-title">{MICROCOPY.fullDone.title}</h2>
      <p className="mt-1.5 text-sm text-text-primary">{MICROCOPY.fullDone.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => tour.startReplay()}>
          {MICROCOPY.fullDone.replay}
        </Button>
        <HubButton label={MICROCOPY.fullDone.hub} />
        <Button size="sm" variant="ghost" onClick={tour.exit}>
          {MICROCOPY.close}
        </Button>
      </div>
    </CardShell>
  );
}

function ReplayClosingCard({
  exitReplay,
}: {
  exitReplay: (destination: "restore" | "hub") => void;
}) {
  const tour = useTour();
  return (
    <CardShell>
      <h2 className="type-section-title">{REPLAY_CLOSING.title}</h2>
      <p className="mt-1.5 text-sm text-text-primary">{REPLAY_CLOSING.body}</p>
      <p className="mt-2 text-xs text-text-secondary">{REPLAY_CLOSING.note}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => tour.startReplay()}>
          {REPLAY_CLOSING.buttons.again}
        </Button>
        <Button size="sm" variant="outline" onClick={() => tour.startFull()}>
          {REPLAY_CLOSING.buttons.full}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => exitReplay("hub")}>
          {REPLAY_CLOSING.buttons.back}
        </Button>
      </div>
    </CardShell>
  );
}

function HubButton({ label }: { label: string }) {
  const tour = useTour();
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        tour.exit();
        navigate({ to: "/tour" });
      }}
    >
      {label}
    </Button>
  );
}

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);
  return reduced;
}

function isNarrow() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

/** Tab cycles inside the panel; the rest of the app stays usable. */
function useFocusTrap(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const first = node.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (items.length === 0) return;
      const activeIndex = items.indexOf(document.activeElement as HTMLElement);
      if (activeIndex === -1) return;
      e.preventDefault();
      const delta = e.shiftKey ? -1 : 1;
      items[(activeIndex + delta + items.length) % items.length]?.focus();
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [ref]);
}

function useDialogKeys(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useFocusTrap(ref);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export { findAnchor };