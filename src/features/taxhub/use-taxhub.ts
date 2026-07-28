import { useMutation, useQueryClient, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  askKnowledge,
  escalateRequest,
  getSnapshot,
  logEvent,
  resetDemo,
  saveDraftSection,
  saveIntakeField,
  setSessionUser,
  setDraftStatus,
} from "./api/taxhub.functions";
import type { KnowledgeResult, RequestOverview, TaxhubSnapshot } from "./types";

export const taxhubQueryKey = ["taxhub", "snapshot"] as const;

export const taxhubQueryOptions = queryOptions({
  queryKey: taxhubQueryKey,
  queryFn: () => getSnapshot(),
});

const emptyOverview = (requestId: string): RequestOverview => ({
  requestId,
  total: 0,
  provided: 0,
  missing: 0,
  uncertain: 0,
  readiness: "no_intake",
});

export function useTaxhub() {
  const { data } = useSuspenseQuery(taxhubQueryOptions);
  return withLookups(data);
}

/**
 * Live retrieval over the 70-passage corpus. The whole grounded answer is
 * assembled on the server; the browser only shows what came back.
 */
export function useAskKnowledge() {
  const ask = useServerFn(askKnowledge);
  return useMutation<KnowledgeResult, Error, { question: string }>({
    mutationFn: (data) => ask({ data }),
  });
}

function withLookups(snapshot: TaxhubSnapshot) {
  return {
    ...snapshot,
    currentUser: snapshot.users.find((u) => u.id === snapshot.currentUserId)!,
    userById: (id: string) => snapshot.users.find((u) => u.id === id),
    clientById: (id: string) => snapshot.clients.find((c) => c.id === id),
    sourceById: (id: string) => snapshot.sources.find((s) => s.id === id),
    requestById: (id: string) => snapshot.requests.find((r) => r.id === id),
    draftById: (id: string) => snapshot.drafts.find((d) => d.id === id),
    overviewFor: (requestId: string) => snapshot.overview[requestId] ?? emptyOverview(requestId),
  };
}

/**
 * Every mutation goes through a server function and then refetches the
 * snapshot, so what the screen shows is always what the database holds.
 */
export function useTaxhubActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: taxhubQueryKey });

  const saveIntake = useServerFn(saveIntakeField);
  const setStatus = useServerFn(setDraftStatus);
  const saveSection = useServerFn(saveDraftSection);
  const escalate = useServerFn(escalateRequest);
  const record = useServerFn(logEvent);
  const reset = useServerFn(resetDemo);
  const switchUser = useServerFn(setSessionUser);

  const updateIntakeField = useMutation({
    mutationFn: (data: { requestId: string; fieldId: string; value: string; actorName: string }) =>
      saveIntake({ data }),
    onSuccess: invalidate,
  });

  const updateDraftStatus = useMutation({
    mutationFn: (data: {
      draftId: string;
      status: "draft" | "approved" | "sent" | "rejected";
      note: string;
    }) => setStatus({ data }),
    onSuccess: invalidate,
  });

  const updateDraftSection = useMutation({
    mutationFn: (data: { draftId: string; index: number; body: string }) => saveSection({ data }),
    onSuccess: invalidate,
  });

  const escalateRequestTo = useMutation({
    mutationFn: (data: {
      requestId: string;
      toUserId: string;
      reason: string;
      actorName: string;
    }) => escalate({ data }),
    onSuccess: invalidate,
  });

  const logActivity = useMutation({
    mutationFn: (data: {
      actor: "assistant" | "user" | "system";
      actorName: string;
      action: string;
      detail: string;
      requestId?: string;
      sourceIds?: string[];
      decision?: "approved" | "rejected" | "corrected" | "escalated";
    }) => record({ data }),
    onSuccess: invalidate,
  });

  const resetDemonstration = useMutation({
    mutationFn: () => reset({ data: undefined }),
    onSuccess: invalidate,
  });

  /** Demonstration control: swaps the stored session user the server reads. */
  const setDemoUser = useMutation({
    mutationFn: (data: { userId: string }) => switchUser({ data }),
    onSuccess: invalidate,
  });

  return {
    updateIntakeField,
    updateDraftStatus,
    updateDraftSection,
    escalateRequest: escalateRequestTo,
    logActivity,
    resetDemonstration,
    setDemoUser,
  };
}