import type { ActivityEvent } from "../types";

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function recordEvent(event: Omit<ActivityEvent, "id" | "at">) {
  const db = await admin();
  const id = `ev-live-${crypto.randomUUID()}`;
  const { error } = await db.from("activity_events").insert({
    id,
    workspace_id: "ws-brandt",
    at: new Date().toISOString(),
    actor: event.actor,
    actor_name: event.actorName,
    action: event.action,
    detail: event.detail,
    request_id: event.requestId ?? null,
    decision: event.decision ?? null,
  });
  if (error) throw new Error(error.message);

  if (event.sourceIds?.length) {
    const { error: linkError } = await db.from("activity_event_sources").insert(
      event.sourceIds.map((sourceId, position) => ({
        event_id: id,
        source_id: sourceId,
        position,
      })),
    );
    if (linkError) throw new Error(linkError.message);
  }
  return id;
}