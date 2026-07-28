import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTaxhub } from "../use-taxhub";
import { waitForAnchor } from "./anchor";
import {
  ALL_AREAS,
  AREA_NAMES,
  STEP_TOURS,
  REPLAY_BEATS,
  WORKFLOW_ORDER,
  type AreaId,
  type ReplayBeat,
  type TourStep,
} from "./tour-content";
import {
  defaultTourState,
  emptyAreaState,
  loadTourState,
  saveTourState,
  type TourState,
} from "./tour-state";

/* ------------------------------------------------------------------ *
 * Live-value bindings (P2). A token that cannot resolve is null, and the
 * step falls back to its structural sentence. A placeholder never renders
 * and a number is never guessed.
 * ------------------------------------------------------------------ */

export interface TourBindings {
  firmName: string | null;
  userFirstName: string | null;
  userRole: string | null;
  approverName: string | null;
  sourceCount: number | null;
  passageCount: number | null;
  outstandingCount: number | null;
  listPriceValue: string | null;
}

export interface DemoCase {
  requestId: string | null;
  draftId: string | null;
  sourceId: string | null;
  passageId: string | null;
  question: string | null;
}

/** Where a step or beat has to be for its anchor to exist. */
export type TourTarget =
  | { kind: "path"; to: "/" | "/inbox" | "/knowledge" | "/sources" | "/drafts" | "/activity" | "/settings" | "/tour" }
  | { kind: "request"; id: string }
  | { kind: "intake"; id: string }
  | { kind: "draft"; id: string }
  | { kind: "source"; id: string; passage?: string };

export interface RunStep {
  anchor: string;
  title: string;
  text: string;
  points: string;
  skipReason?: TourStep["skipReason"];
  target: TourTarget | null;
  /** Seconds — replay only. */
  dwell?: number;
}

export type RunMode = "area" | "full" | "replay";
export type RunPhase = "preparing" | "running" | "area-done" | "tour-done" | "replay-done";

export interface TourRun {
  mode: RunMode;
  areaSeq: AreaId[];
  areaIdx: number;
  steps: RunStep[];
  idx: number;
  skipped: string[];
  paused: boolean;
  manual: boolean;
  phase: RunPhase;
}

export type WelcomeVariant = "first" | "returning";

interface TourApi {
  hydrated: boolean;
  state: TourState;
  bindings: TourBindings;
  demo: DemoCase;
  run: TourRun | null;
  welcome: WelcomeVariant | null;
  popupArea: AreaId | null;
  currentArea: AreaId | null;
  /** Set while the replay is on the knowledge screen. Read-only lane. */
  replayQuestion: string | null;
  startArea: (area: AreaId, opts?: { fromStep?: number }) => void;
  startFull: (opts?: { resume?: boolean }) => void;
  startReplay: (opts?: { manual?: boolean }) => void;
  next: () => void;
  back: () => void;
  skipArea: () => void;
  exit: () => void;
  togglePause: () => void;
  dropCurrentStep: () => void;
  openWelcome: (variant: WelcomeVariant) => void;
  closeWelcome: (dontShowAgain: boolean) => void;
  closePopup: (dontShowAgain: boolean) => void;
  setGlobalOff: (off: boolean) => void;
  setAreaDismissed: (area: AreaId, dismissed: boolean) => void;
  restoreDismissedPopups: () => void;
  resetAllTourProgress: () => void;
  clearFullTour: () => void;
}

const TourContext = createContext<TourApi | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

/** Safe for components that may render outside the provider (never throws). */
export function useOptionalTour() {
  return useContext(TourContext);
}

export function areaFromPathname(pathname: string): AreaId | null {
  if (pathname === "/") return "overview";
  if (pathname.startsWith("/inbox/")) return "request";
  if (pathname.startsWith("/inbox")) return "inbox";
  if (pathname.startsWith("/intake")) return "intake";
  if (pathname.startsWith("/knowledge")) return "knowledge";
  if (pathname.startsWith("/sources")) return "sources";
  if (pathname.startsWith("/drafts")) return "drafts";
  if (pathname.startsWith("/activity")) return "activity";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/tour")) return "tour";
  return null;
}

export function pathnameOf(target: TourTarget): string {
  switch (target.kind) {
    case "path":
      return target.to;
    case "request":
      return `/inbox/${target.id}`;
    case "intake":
      return `/intake/${target.id}`;
    case "draft":
      return `/drafts/${target.id}`;
    case "source":
      return `/sources/${target.id}`;
  }
}

export function applyTokens(text: string, bindings: TourBindings): string | null {
  let missing = false;
  const out = text.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const value = (bindings as unknown as Record<string, unknown>)[key];
    if (value === null || value === undefined || value === "") {
      missing = true;
      return "";
    }
    return String(value);
  });
  return missing ? null : out;
}

/** Bound variant when every token resolves, structural fallback otherwise. */
export function resolveText(
  bound: string | undefined,
  fallback: string,
  bindings: TourBindings,
): string {
  if (!bound) return fallback;
  return applyTokens(bound, bindings) ?? fallback;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const snapshot = useTaxhub();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<TourState>(() => defaultTourState());
  const [run, setRun] = useState<TourRun | null>(null);
  const [welcome, setWelcome] = useState<WelcomeVariant | null>(null);
  const [popupArea, setPopupArea] = useState<AreaId | null>(null);
  const returnTo = useRef<string | null>(null);
  const focusBefore = useRef<HTMLElement | null>(null);

  /* ---------------- persistence (never read during render) -------- */

  useEffect(() => {
    setState(loadTourState());
    setHydrated(true);
  }, []);

  const patch = useCallback((fn: (prev: TourState) => TourState) => {
    setState((prev) => {
      const next = fn(prev);
      saveTourState(next);
      return next;
    });
  }, []);

  /* ---------------- live bindings and the demonstration case ------ */

  const demo = useMemo<DemoCase>(() => {
    const request =
      snapshot.requests.find((r) => r.category === "company_car") ?? snapshot.requests[0] ?? null;
    const draft =
      snapshot.drafts.find((d) => d.requestId === request?.id) ?? snapshot.drafts[0] ?? null;
    const citation = request?.answers[0]?.citations[0];
    return {
      requestId: request?.id ?? null,
      draftId: draft?.id ?? null,
      sourceId: citation?.sourceId ?? snapshot.sources[0]?.id ?? null,
      passageId: citation?.passageId ?? null,
      question:
        request?.answers[0]?.question ??
        snapshot.knowledge.find((k) => k.suggested)?.prompt ??
        null,
    };
  }, [snapshot.requests, snapshot.drafts, snapshot.sources, snapshot.knowledge]);

  const bindings = useMemo<TourBindings>(() => {
    const request = demo.requestId ? snapshot.requestById(demo.requestId) : undefined;
    const overview = demo.requestId ? snapshot.overviewFor(demo.requestId) : null;
    const listPrice = request?.intake.find((f) => f.id === "f-list-price");
    const approver = snapshot.users.find((u) => u.canApprove);
    return {
      firmName: snapshot.workspace.firmName || null,
      userFirstName: snapshot.currentUser?.name?.split(" ")[0] ?? null,
      userRole: snapshot.currentUser?.role ?? null,
      approverName: approver?.name ?? null,
      sourceCount: snapshot.sources.length || null,
      passageCount:
        snapshot.sources.reduce((n, s) => n + s.passages.length, 0) || null,
      outstandingCount:
        overview && overview.total > 0 ? overview.total - overview.provided : null,
      listPriceValue: listPrice?.value?.trim() ? listPrice.value : null,
    };
  }, [snapshot, demo.requestId]);

  /* ---------------- step construction ----------------------------- */

  const targetFor = useCallback(
    (area: AreaId, step: TourStep): TourTarget | null => {
      switch (area) {
        case "overview":
          return { kind: "path", to: "/" };
        case "inbox":
          return { kind: "path", to: "/inbox" };
        case "request":
          return demo.requestId ? { kind: "request", id: demo.requestId } : null;
        case "intake":
          return demo.requestId ? { kind: "intake", id: demo.requestId } : null;
        case "knowledge":
          return { kind: "path", to: "/knowledge" };
        case "sources":
          if (step.at === "detail") {
            return demo.sourceId
              ? { kind: "source", id: demo.sourceId, passage: demo.passageId ?? undefined }
              : null;
          }
          return { kind: "path", to: "/sources" };
        case "drafts":
          if (step.at === "detail") {
            return demo.draftId ? { kind: "draft", id: demo.draftId } : null;
          }
          return { kind: "path", to: "/drafts" };
        case "activity":
          return { kind: "path", to: "/activity" };
        case "settings":
          return { kind: "path", to: "/settings" };
        case "tour":
          return { kind: "path", to: "/tour" };
      }
    },
    [demo],
  );

  const buildAreaSteps = useCallback(
    (area: AreaId): RunStep[] =>
      STEP_TOURS[area].map((step) => ({
        anchor: step.anchor,
        title: step.title,
        text: resolveText(step.bound, step.body, bindings),
        points: step.points,
        skipReason: step.skipReason,
        target: targetFor(area, step),
      })),
    [bindings, targetFor],
  );

  const beatTarget = useCallback(
    (beat: ReplayBeat): TourTarget | null => {
      switch (beat.place) {
        case "inbox":
          return { kind: "path", to: "/inbox" };
        case "request":
          return demo.requestId ? { kind: "request", id: demo.requestId } : null;
        case "intake":
          return demo.requestId ? { kind: "intake", id: demo.requestId } : null;
        case "knowledge":
          return { kind: "path", to: "/knowledge" };
        case "source-passage":
          return demo.sourceId
            ? { kind: "source", id: demo.sourceId, passage: demo.passageId ?? undefined }
            : null;
        case "draft":
          return demo.draftId ? { kind: "draft", id: demo.draftId } : null;
        case "activity":
          return { kind: "path", to: "/activity" };
      }
    },
    [demo],
  );

  const buildBeats = useCallback(
    (): RunStep[] =>
      REPLAY_BEATS.map((beat) => ({
        anchor: beat.anchor,
        title: "",
        text: resolveText(beat.bound, beat.text, bindings),
        points: beat.points,
        skipReason: beat.skipReason,
        target: beatTarget(beat),
        dwell: beat.dwell,
      })),
    [bindings, beatTarget],
  );

  /* ---------------- navigation for the active step ---------------- */

  const go = useCallback(
    (target: TourTarget) => {
      switch (target.kind) {
        case "path":
          navigate({ to: target.to });
          return;
        case "request":
          navigate({ to: "/inbox/$requestId", params: { requestId: target.id } });
          return;
        case "intake":
          navigate({ to: "/intake/$requestId", params: { requestId: target.id } });
          return;
        case "draft":
          navigate({ to: "/drafts/$draftId", params: { draftId: target.id } });
          return;
        case "source":
          navigate({
            to: "/sources/$sourceId",
            params: { sourceId: target.id },
            search: target.passage ? { passage: target.passage } : {},
          });
          return;
      }
    },
    [navigate],
  );

  const activeStep = run && run.phase === "running" ? run.steps[run.idx] : undefined;

  useEffect(() => {
    if (!activeStep?.target) return;
    const wanted = pathnameOf(activeStep.target);
    if (wanted !== pathname) go(activeStep.target);
  }, [activeStep, pathname, go]);

  /* ---------------- prepare: build the runtime sequence ----------- */

  useEffect(() => {
    if (!run || run.phase !== "preparing") return;
    let cancelled = false;
    const first = run.steps[0];
    if (first?.target && pathnameOf(first.target) !== pathname) {
      go(first.target);
      return;
    }
    // Steps that share this route can be checked now, so the counter is
    // right from step 1. Steps on another route are resolved when we get
    // there and are spliced out at that point if nothing is present.
    const timer = window.setTimeout(async () => {
      const here = run.steps.map((s) => (s.target ? pathnameOf(s.target) : null));
      const results = await Promise.all(
        run.steps.map(async (step, i) => {
          if (step.target === null) return false;
          if (here[i] !== pathname) return true;
          const el = await waitForAnchor(step.anchor, 900).promise;
          return Boolean(el);
        }),
      );
      if (cancelled) return;
      const keep = run.steps.filter((_, i) => results[i]);
      const dropped = run.steps.filter((_, i) => !results[i]).map((s) => s.title);
      setRun((prev) => {
        if (!prev || prev.phase !== "preparing") return prev;
        if (keep.length === 0) {
          return { ...prev, steps: [], skipped: dropped, phase: "area-done" };
        }
        return {
          ...prev,
          steps: keep,
          idx: Math.min(prev.idx, keep.length - 1),
          skipped: dropped,
          phase: "running",
        };
      });
    }, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [run, pathname, go]);

  /* ---------------- progress persistence -------------------------- */

  useEffect(() => {
    if (!run || run.phase !== "running" || run.mode === "replay") return;
    const area = run.areaSeq[run.areaIdx];
    patch((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [area]: {
          ...prev.areas[area],
          tourStatus:
            prev.areas[area].tourStatus === "completed" ? "completed" : "in_progress",
          lastStepIndex: run.idx,
          lastStepTotal: run.steps.length,
          popupSeen: true,
        },
      },
      full:
        run.mode === "full"
          ? { areaIndex: run.areaIdx, stepIndex: run.idx, active: true }
          : prev.full,
    }));
  }, [run?.idx, run?.areaIdx, run?.phase, run?.mode, run?.steps.length, patch]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- run control ----------------------------------- */

  const rememberFocus = () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      focusBefore.current = document.activeElement;
    }
  };

  const restoreFocus = () => {
    const el = focusBefore.current;
    focusBefore.current = null;
    if (el && document.contains(el)) el.focus();
  };

  const startArea = useCallback(
    (area: AreaId, opts?: { fromStep?: number }) => {
      rememberFocus();
      setWelcome(null);
      setPopupArea(null);
      const steps = buildAreaSteps(area);
      setRun({
        mode: "area",
        areaSeq: [area],
        areaIdx: 0,
        steps,
        idx: Math.min(opts?.fromStep ?? 0, Math.max(steps.length - 1, 0)),
        skipped: [],
        paused: false,
        manual: true,
        phase: "preparing",
      });
    },
    [buildAreaSteps],
  );

  const startFull = useCallback(
    (opts?: { resume?: boolean }) => {
      rememberFocus();
      setWelcome(null);
      setPopupArea(null);
      const areaIdx = opts?.resume ? Math.min(state.full.areaIndex, WORKFLOW_ORDER.length - 1) : 0;
      const area = WORKFLOW_ORDER[areaIdx];
      setRun({
        mode: "full",
        areaSeq: WORKFLOW_ORDER,
        areaIdx,
        steps: buildAreaSteps(area),
        idx: opts?.resume ? state.full.stepIndex : 0,
        skipped: [],
        paused: false,
        manual: true,
        phase: "preparing",
      });
    },
    [buildAreaSteps, state.full],
  );

  const startReplay = useCallback(
    (opts?: { manual?: boolean }) => {
      rememberFocus();
      setWelcome(null);
      setPopupArea(null);
      returnTo.current = pathname;
      setRun({
        mode: "replay",
        areaSeq: [],
        areaIdx: 0,
        steps: buildBeats(),
        idx: 0,
        skipped: [],
        paused: false,
        manual: Boolean(opts?.manual),
        phase: "preparing",
      });
    },
    [buildBeats, pathname],
  );

  const finishArea = useCallback(
    (completed: boolean) => {
      setRun((prev) => {
        if (!prev) return prev;
        if (prev.mode === "replay") {
          return { ...prev, phase: "replay-done" };
        }
        const area = prev.areaSeq[prev.areaIdx];
        if (completed) {
          patch((s) => ({
            ...s,
            areas: {
              ...s.areas,
              [area]: {
                ...s.areas[area],
                tourStatus: "completed",
                completedAt: new Date().toISOString(),
                popupSeen: true,
              },
            },
          }));
        }
        return { ...prev, phase: "area-done" };
      });
    },
    [patch],
  );

  const exit = useCallback(() => {
    setRun((prev) => {
      if (prev?.mode === "replay") {
        patch((s) => ({ ...s, replay: { lastCompletedAt: new Date().toISOString() } }));
      }
      if (prev?.mode === "full") {
        patch((s) => ({ ...s, full: { ...s.full, active: false } }));
      }
      return null;
    });
    restoreFocus();
  }, [patch]);

  const next = useCallback(() => {
    setRun((prev) => {
      if (!prev) return prev;
      if (prev.phase !== "running") return prev;
      if (prev.idx + 1 < prev.steps.length) return { ...prev, idx: prev.idx + 1 };
      if (prev.mode === "replay") return { ...prev, phase: "replay-done" };
      const area = prev.areaSeq[prev.areaIdx];
      patch((s) => ({
        ...s,
        areas: {
          ...s.areas,
          [area]: {
            ...s.areas[area],
            tourStatus: "completed",
            completedAt: new Date().toISOString(),
            popupSeen: true,
          },
        },
      }));
      return { ...prev, phase: "area-done" };
    });
  }, [patch]);

  const back = useCallback(() => {
    setRun((prev) => {
      if (!prev) return prev;
      if (prev.idx > 0) return { ...prev, idx: prev.idx - 1, phase: "running" };
      if (prev.mode === "full" && prev.areaIdx > 0) {
        const areaIdx = prev.areaIdx - 1;
        return {
          ...prev,
          areaIdx,
          steps: buildAreaSteps(prev.areaSeq[areaIdx]),
          idx: Number.MAX_SAFE_INTEGER,
          skipped: [],
          phase: "preparing",
        };
      }
      return prev;
    });
  }, [buildAreaSteps]);

  const advanceArea = useCallback(() => {
    setRun((prev) => {
      if (!prev || prev.mode !== "full") return null;
      const areaIdx = prev.areaIdx + 1;
      if (areaIdx >= prev.areaSeq.length) return { ...prev, phase: "tour-done" };
      return {
        ...prev,
        areaIdx,
        steps: buildAreaSteps(prev.areaSeq[areaIdx]),
        idx: 0,
        skipped: [],
        phase: "preparing",
      };
    });
  }, [buildAreaSteps]);

  const skipArea = useCallback(() => {
    setRun((prev) => {
      if (!prev) return prev;
      if (prev.mode === "full") return { ...prev, phase: "area-done" };
      return null;
    });
    if (run?.mode !== "full") restoreFocus();
  }, [run?.mode]);

  /** Removes the current step from the runtime sequence (P3, honest skip). */
  const dropCurrentStep = useCallback(() => {
    setRun((prev) => {
      if (!prev || prev.phase !== "running") return prev;
      const dropped = prev.steps[prev.idx];
      const steps = prev.steps.filter((_, i) => i !== prev.idx);
      const skipped = dropped ? [...prev.skipped, dropped.title || dropped.anchor] : prev.skipped;
      if (steps.length === 0) {
        return { ...prev, steps, skipped, phase: prev.mode === "replay" ? "replay-done" : "area-done" };
      }
      if (prev.idx >= steps.length) {
        return { ...prev, steps, skipped, idx: steps.length - 1, phase: prev.mode === "replay" ? "replay-done" : "area-done" };
      }
      return { ...prev, steps, skipped };
    });
  }, []);

  const togglePause = useCallback(() => {
    setRun((prev) => (prev ? { ...prev, paused: !prev.paused } : prev));
  }, []);

  /* ---------------- replay: restore the app on exit --------------- */

  const exitReplay = useCallback(
    (destination: "restore" | "hub") => {
      const back = returnTo.current;
      returnTo.current = null;
      patch((s) => ({ ...s, replay: { lastCompletedAt: new Date().toISOString() } }));
      setRun(null);
      restoreFocus();
      if (destination === "hub") {
        navigate({ to: "/tour" });
      } else if (back && back !== pathname) {
        navigate({ to: back });
      }
    },
    [navigate, pathname, patch],
  );

  /* ---------------- first-visit triggers -------------------------- */

  const currentArea = areaFromPathname(pathname);

  useEffect(() => {
    if (!hydrated || run || state.globalOff) return;
    if (currentArea === "overview" && !state.welcomeSeen) {
      setWelcome("first");
      return;
    }
    if (!currentArea) return;
    if (currentArea === "overview" && !state.welcomeSeen) return;
    const area = state.areas[currentArea] ?? emptyAreaState();
    if (!area.popupSeen && !area.popupDismissed) {
      setPopupArea(currentArea);
    }
  }, [hydrated, currentArea, state, run]);

  /* ---------------- welcome / popup handlers ---------------------- */

  const openWelcome = useCallback((variant: WelcomeVariant) => setWelcome(variant), []);

  const closeWelcome = useCallback(
    (dontShowAgain: boolean) => {
      setWelcome(null);
      patch((s) => ({
        ...s,
        welcomeSeen: true,
        welcomeDismissed: dontShowAgain || s.welcomeDismissed,
      }));
    },
    [patch],
  );

  const closePopup = useCallback(
    (dontShowAgain: boolean) => {
      const area = popupArea;
      setPopupArea(null);
      if (!area) return;
      patch((s) => ({
        ...s,
        areas: {
          ...s.areas,
          [area]: { ...s.areas[area], popupSeen: true, popupDismissed: dontShowAgain },
        },
      }));
    },
    [patch, popupArea],
  );

  const setGlobalOff = useCallback(
    (off: boolean) => patch((s) => ({ ...s, globalOff: off })),
    [patch],
  );

  const setAreaDismissed = useCallback(
    (area: AreaId, dismissed: boolean) =>
      patch((s) => ({
        ...s,
        areas: { ...s.areas, [area]: { ...s.areas[area], popupDismissed: dismissed } },
      })),
    [patch],
  );

  const restoreDismissedPopups = useCallback(
    () =>
      patch((s) => {
        const areas = { ...s.areas };
        for (const area of ALL_AREAS) {
          areas[area] = { ...areas[area], popupDismissed: false, popupSeen: false };
        }
        return { ...s, areas };
      }),
    [patch],
  );

  const resetAllTourProgress = useCallback(() => {
    setRun(null);
    setWelcome(null);
    setPopupArea(null);
    const fresh = defaultTourState();
    saveTourState(fresh);
    setState(fresh);
  }, []);

  const clearFullTour = useCallback(
    () => patch((s) => ({ ...s, full: { areaIndex: 0, stepIndex: 0, active: false } })),
    [patch],
  );

  /* ---------------- knowledge lane for the replay ----------------- */

  const replayQuestion =
    run?.mode === "replay" &&
    run.phase === "running" &&
    run.steps[run.idx]?.target?.kind === "path" &&
    (run.steps[run.idx].target as { to: string }).to === "/knowledge"
      ? demo.question
      : null;

  const api: TourApi = {
    hydrated,
    state,
    bindings,
    demo,
    run,
    welcome,
    popupArea,
    currentArea,
    replayQuestion,
    startArea,
    startFull,
    startReplay,
    next,
    back,
    skipArea,
    exit,
    togglePause,
    dropCurrentStep,
    openWelcome,
    closeWelcome,
    closePopup,
    setGlobalOff,
    setAreaDismissed,
    restoreDismissedPopups,
    resetAllTourProgress,
    clearFullTour,
  };

  return (
    <TourContext.Provider value={api}>
      {children}
      <TourRunner advanceArea={advanceArea} exitReplay={exitReplay} finishArea={finishArea} />
    </TourContext.Provider>
  );
}

/**
 * Split out so the overlay module can stay presentational while the
 * provider owns state. Imported lazily-by-reference to avoid a cycle.
 */
import { TourLayer } from "./tour-ui";

function TourRunner(props: {
  advanceArea: () => void;
  exitReplay: (destination: "restore" | "hub") => void;
  finishArea: (completed: boolean) => void;
}) {
  return <TourLayer {...props} />;
}

export { AREA_NAMES };