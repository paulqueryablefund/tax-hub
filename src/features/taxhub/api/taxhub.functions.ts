import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { KnowledgeResult, TaxhubSnapshot } from "../types";
import { buildSnapshot } from "./snapshot.server";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Reads the whole demo workspace. Public, read-only, no session required. */
export const getSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<TaxhubSnapshot> => buildSnapshot(publicClient()),
);

const eventInput = z.object({
  actor: z.enum(["assistant", "user", "system"]),
  actorName: z.string().min(1),
  action: z.string().min(1),
  detail: z.string(),
  requestId: z.string().optional(),
  sourceIds: z.array(z.string()).optional(),
  decision: z.enum(["approved", "rejected", "corrected", "escalated"]).optional(),
});

export const logEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventInput.parse(data))
  .handler(async ({ data }) => {
    const { recordEvent } = await import("./writes.server");
    await recordEvent(data);
    return { ok: true };
  });

export const saveIntakeField = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        requestId: z.string(),
        fieldId: z.string(),
        value: z.string(),
        actorName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { admin, recordEvent } = await import("./writes.server");
    const db = await admin();
    const { error } = await db
      .from("intake_fields")
      .update({
        value: data.value.trim() ? data.value : null,
        status: data.value.trim() ? "provided" : "missing",
      })
      .eq("request_id", data.requestId)
      .eq("id", data.fieldId);
    if (error) throw new Error(error.message);

    const { data: field } = await db
      .from("intake_fields")
      .select("label")
      .eq("request_id", data.requestId)
      .eq("id", data.fieldId)
      .maybeSingle();

    await recordEvent({
      actor: "user",
      actorName: data.actorName,
      action: "Intake item completed",
      detail: `Recorded a value for "${field?.label ?? data.fieldId}".`,
      requestId: data.requestId,
    });
    return { ok: true };
  });

export const setDraftStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        draftId: z.string(),
        status: z.enum(["draft", "approved", "sent", "rejected"]),
        note: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { admin, recordEvent } = await import("./writes.server");
    const db = await admin();

    const { data: draft, error: readError } = await db
      .from("drafts")
      .select("request_id, is_external")
      .eq("id", data.draftId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!draft) throw new Error("Draft not found");

    // Who is acting is read from the stored session, never from the request
    // body: a caller cannot claim to be an approver.
    const { data: actor, error: actorError } = await db
      .from("app_users")
      .select("id, name, role, can_approve")
      .eq("is_current_user", true)
      .maybeSingle();
    if (actorError) throw new Error(actorError.message);
    if (!actor) throw new Error("No active session user");

    if (draft.is_external && (data.status === "approved" || data.status === "rejected")) {
      // Authority is decided here, not in the UI.
      if (!actor.can_approve) {
        throw new Error(
          `${actor.name} (${actor.role}) may not approve or reject outgoing client correspondence.`,
        );
      }
    }

    // Authority is not the only gate. A reply that rests on a figure the
    // client stated but never evidenced must not leave the firm, however
    // senior the approver is.
    if (draft.is_external && data.status === "approved") {
      const { data: unevidenced, error: intakeError } = await db
        .from("intake_fields")
        .select("label")
        .eq("request_id", draft.request_id)
        .eq("status", "uncertain");
      if (intakeError) throw new Error(intakeError.message);
      if (unevidenced?.length) {
        throw new Error(
          `This reply cannot be sent yet. ${unevidenced
            .map((f) => `"${f.label}"`)
            .join(", ")} is recorded but not evidenced, and the answer depends on it. Obtain the evidence, or remove the statement that relies on it, before approving.`,
        );
      }
    }

    const { error } = await db
      .from("drafts")
      .update({ status: data.status })
      .eq("id", data.draftId);
    if (error) throw new Error(error.message);

    if (data.status === "approved") {
      await db
        .from("requests")
        .update({ lifecycle_status: "approved" })
        .eq("id", draft.request_id);
    }

    await recordEvent({
      actor: "user",
      actorName: actor.name,
      action:
        data.status === "approved"
          ? "Draft approved and sent"
          : data.status === "rejected"
            ? "Draft rejected"
            : "Draft updated",
      detail: data.note,
      requestId: draft.request_id,
      decision:
        data.status === "approved"
          ? "approved"
          : data.status === "rejected"
            ? "rejected"
            : undefined,
    });
    return { ok: true };
  });

export const saveDraftSection = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ draftId: z.string(), index: z.number().int().min(0), body: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await import("./writes.server");
    const db = await admin();
    const { error } = await db
      .from("draft_sections")
      .update({ body: data.body })
      .eq("draft_id", data.draftId)
      .eq("position", data.index);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const escalateRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        requestId: z.string(),
        toUserId: z.string(),
        reason: z.string().min(1),
        actorName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { admin, recordEvent } = await import("./writes.server");
    const db = await admin();
    const { error } = await db
      .from("requests")
      .update({
        escalation_reason: data.reason,
        escalation_to_user_id: data.toUserId,
        escalation_at: new Date().toISOString(),
      })
      .eq("id", data.requestId);
    if (error) throw new Error(error.message);

    await recordEvent({
      actor: "user",
      actorName: data.actorName,
      action: "Escalated to a Steuerberater",
      detail: data.reason,
      requestId: data.requestId,
      decision: "escalated",
    });
    return { ok: true };
  });

export const resetDemo = createServerFn({ method: "POST" }).handler(async () => {
  const { admin } = await import("./writes.server");
  const db = await admin();
  const { error } = await db.rpc("reset_demo");
  if (error) throw new Error(error.message);
  return { ok: true };
});

/**
 * Demonstration control only. There is no authentication in this prototype;
 * the "signed-in" user is a single stored flag on app_users, and every
 * server-side authority check reads that flag rather than anything the
 * browser sends. Switching therefore changes what the server permits.
 */
export const setSessionUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ userId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { admin } = await import("./writes.server");
    const db = await admin();

    const { data: user, error: readError } = await db
      .from("app_users")
      .select("id, name, role, can_approve")
      .eq("id", data.userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!user) throw new Error("Unknown user");

    const { error: clearError } = await db
      .from("app_users")
      .update({ is_current_user: false })
      .eq("is_current_user", true);
    if (clearError) throw new Error(clearError.message);

    const { error } = await db
      .from("app_users")
      .update({ is_current_user: true })
      .eq("id", user.id);
    if (error) throw new Error(error.message);

    // Deliberately not written to activity_events: that table is the audit
    // trail of client work, not a log of demonstration controls.
    return { ok: true, name: user.name, role: user.role, canApprove: user.can_approve };
  });

/**
 * Live retrieval over the corpus. The caller sends a question and who is
 * asking; the visibility tier is resolved here, never trusted from the client.
 */
export const askKnowledge = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ question: z.string().min(1).max(500), userId: z.string() }).parse(data),
  )
  .handler(async ({ data }): Promise<KnowledgeResult> => {
    const { admin } = await import("./writes.server");
    const { resolveVisibility } = await import("./visibility.server");
    const { askKnowledge: run } = await import("./retrieval.server");

    const db = await admin();
    const { data: user } = await db
      .from("app_users")
      .select("role")
      .eq("id", data.userId)
      .maybeSingle();

    return run(data.question, resolveVisibility(user?.role));
  });