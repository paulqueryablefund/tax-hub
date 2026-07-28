/**
 * Which visibility tier a role may read. Decided on the server so a client
 * cannot ask for passages above its own tier.
 */
export function resolveVisibility(role: string | null | undefined): string {
  switch ((role ?? "").toLowerCase()) {
    case "partner":
      return "partners_only";
    case "steuerberater":
      return "professionals_only";
    default:
      return "all_staff";
  }
}
