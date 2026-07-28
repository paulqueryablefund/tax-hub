import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { TaxhubSnapshot } from "../types";
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
        actorUserId: z.string(),
        actorName: z.string(),
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

    // Approval authority is decided here, not in the UI. A draft that leaves
    // the firm can only be approved or rejected by a user with signing rights.
    if (draft.is_external && (data.status === "approved" || data.status === "rejected")) {
      const { data: actor, error: actorError } = await db
        .from("users")
        .select("can_approve, name")
        .eq("id", data.actorUserId)
        .maybeSingle();
      if (actorError) throw new Error(actorError.message);
      if (!actor?.can_approve) {
        throw new Error(
          "This user may not approve or reject outgoing client correspondence.",
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
      actorName: data.actorName,
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