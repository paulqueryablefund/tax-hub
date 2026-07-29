/**
 * Tour telemetry storage.
 *
 * HARD CONSTRAINT (P4): no tour event is ever written to `activity_events`.
 * That table is the audit trail of client work; product telemetry in it
 * destroys its evidential value. Tour state lives in localStorage under a
 * single versioned, namespaced key and nowhere else.
 *
 * SSR-safe: nothing in this module reads `window` at module scope, and the
 * provider never reads storage during render.
 */

import { ALL_AREAS, type AreaId } from "./tour-content";

export const TOUR_STORAGE_KEY = "werkflow.tour.v1";
/** Marks one sign-in session. Cleared on sign-out and by closing the tab. */
export const TOUR_SESSION_KEY = "werkflow.tour.session.v1";
export const TOUR_STATE_VERSION = 1;

export type AreaTourStatus = "not_started" | "in_progress" | "completed";

export interface AreaTourState {
  popupSeen: boolean;
  popupDismissed: boolean;
  tourStatus: AreaTourStatus;
  lastStepIndex: number;
  /** Length of the runtime step sequence when progress was last saved. */
  lastStepTotal: number;
  completedAt: string | null;
}

export interface FullTourState {
  areaIndex: number;
  stepIndex: number;
  active: boolean;
}

export interface TourState {
  version: number;
  welcomeSeen: boolean;
  welcomeDismissed: boolean;
  globalOff: boolean;
  areas: Record<AreaId, AreaTourState>;
  full: FullTourState;
  replay: { lastCompletedAt: string | null };
}

export function emptyAreaState(): AreaTourState {
  return {
    popupSeen: false,
    popupDismissed: false,
    tourStatus: "not_started",
    lastStepIndex: 0,
    lastStepTotal: 0,
    completedAt: null,
  };
}

export function defaultTourState(): TourState {
  const areas = {} as Record<AreaId, AreaTourState>;
  for (const area of ALL_AREAS) areas[area] = emptyAreaState();
  return {
    version: TOUR_STATE_VERSION,
    welcomeSeen: false,
    welcomeDismissed: false,
    globalOff: false,
    areas,
    full: { areaIndex: 0, stepIndex: 0, active: false },
    replay: { lastCompletedAt: null },
  };
}

/** Reads persisted state. Returns the default shape on any failure. */
export function loadTourState(): TourState {
  if (typeof window === "undefined") return defaultTourState();
  try {
    const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return defaultTourState();
    const parsed = JSON.parse(raw) as Partial<TourState>;
    if (parsed.version !== TOUR_STATE_VERSION) return defaultTourState();
    const base = defaultTourState();
    return {
      ...base,
      ...parsed,
      areas: { ...base.areas, ...(parsed.areas ?? {}) },
      full: { ...base.full, ...(parsed.full ?? {}) },
      replay: { ...base.replay, ...(parsed.replay ?? {}) },
      version: TOUR_STATE_VERSION,
    };
  } catch {
    return defaultTourState();
  }
}

export function saveTourState(state: TourState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode, quota) — the tour still runs, it
       simply forgets. Never throw from a help system. */
  }
}

/**
 * The welcome modal opens once per sign-in, not once per browser.
 *
 * On the first read of a sign-in session the `welcomeSeen` flag is cleared so
 * the introduction is offered again. Two explicit opt-outs are respected and
 * never overridden: "Don't show this again" (`welcomeDismissed`) and the
 * global off switch in Settings (`globalOff`). Per-area popups and tour
 * progress are untouched — they stay remembered across sessions.
 */
export function startTourSession(state: TourState): TourState {
  if (typeof window === "undefined") return state;
  try {
    if (window.sessionStorage.getItem(TOUR_SESSION_KEY)) return state;
    window.sessionStorage.setItem(TOUR_SESSION_KEY, new Date().toISOString());
  } catch {
    return state;
  }
  if (state.globalOff || state.welcomeDismissed) return state;
  const next: TourState = { ...state, welcomeSeen: false };
  saveTourState(next);
  return next;
}

/** Called on sign-out so the next sign-in counts as a new session. */
export function endTourSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(TOUR_SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Display status for the hub (§5.5): dismissal is shown, not stored twice. */
export function displayStatus(
  area: AreaTourState,
): "not_started" | "in_progress" | "completed" | "dismissed" {
  if (area.tourStatus === "completed") return "completed";
  if (area.tourStatus === "in_progress") return "in_progress";
  if (area.popupDismissed) return "dismissed";
  return "not_started";
}