import { useSyncExternalStore } from "react";
import { drafts as seedDrafts, requests as seedRequests, seedActivity } from "./data/requests";
import type { ActivityEvent, Draft, IntakeField, RequestRecord } from "./types";

/**
 * Demo store. Deterministic, in-memory, no backend.
 *
 * Persistence, real document ingestion and real retrieval are deliberately
 * out of scope for this prototype — see the accompanying product brief.
 */
interface State {
  requests: RequestRecord[];
  drafts: Draft[];
  activity: ActivityEvent[];
}

let state: State = {
  requests: seedRequests,
  drafts: seedDrafts,
  activity: seedActivity,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useTaxhubState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let eventCounter = 100;

function nowIso() {
  return new Date().toISOString();
}

export function logEvent(event: Omit<ActivityEvent, "id" | "at">) {
  eventCounter += 1;
  state = {
    ...state,
    activity: [{ ...event, id: `ev-${eventCounter}`, at: nowIso() }, ...state.activity],
  };
  emit();
}

export function updateIntakeField(
  requestId: string,
  fieldId: string,
  value: string,
  actorName: string,
) {
  state = {
    ...state,
    requests: state.requests.map((r) =>
      r.id !== requestId
        ? r
        : {
            ...r,
            intake: r.intake.map((f): IntakeField =>
              f.id !== fieldId
                ? f
                : { ...f, value, status: value.trim() ? "provided" : "missing" },
            ),
          },
    ),
  };
  emit();
  logEvent({
    actor: "user",
    actorName,
    action: "Intake item completed",
    detail: `Recorded a value for "${fieldId}".`,
    requestId,
  });
}

export function setDraftStatus(
  draftId: string,
  status: Draft["status"],
  actorName: string,
  note: string,
) {
  const draft = state.drafts.find((d) => d.id === draftId);
  state = {
    ...state,
    drafts: state.drafts.map((d) => (d.id === draftId ? { ...d, status } : d)),
    requests: state.requests.map((r) =>
      draft && r.id === draft.requestId && status === "approved"
        ? { ...r, status: "approved" }
        : r,
    ),
  };
  emit();
  logEvent({
    actor: "user",
    actorName,
    action:
      status === "approved"
        ? "Draft approved and sent"
        : status === "rejected"
          ? "Draft rejected"
          : "Draft updated",
    detail: note,
    requestId: draft?.requestId,
    decision: status === "approved" ? "approved" : status === "rejected" ? "rejected" : undefined,
  });
}

export function updateDraftSection(draftId: string, index: number, body: string) {
  state = {
    ...state,
    drafts: state.drafts.map((d) =>
      d.id !== draftId
        ? d
        : {
            ...d,
            sections: d.sections.map((s, i) => (i === index ? { ...s, body } : s)),
          },
    ),
  };
  emit();
}

export function escalateRequest(requestId: string, toUserId: string, reason: string, actorName: string) {
  state = {
    ...state,
    requests: state.requests.map((r) =>
      r.id !== requestId ? r : { ...r, escalation: { reason, toUserId, at: nowIso() } },
    ),
  };
  emit();
  logEvent({
    actor: "user",
    actorName,
    action: "Escalated to a Steuerberater",
    detail: reason,
    requestId,
    decision: "escalated",
  });
}

export function resetDemo() {
  state = { requests: seedRequests, drafts: seedDrafts, activity: seedActivity };
  emit();
}