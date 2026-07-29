/**
 * One validation contract for intake values, imported by both the intake
 * screen and the server function that writes them. Client and server cannot
 * disagree, and an invalid value never reaches the record or the audit trail.
 *
 * Empty stays legal: clearing a field is how a recorded fact is returned to
 * "missing".
 */

export type IntakeFieldType = "text" | "date" | "number" | "select" | "file" | "boolean";

export type IntakeValidation = { ok: true } | { ok: false; message: string };

const BOOLEAN_OPTIONS = ["Yes", "No"];

export function booleanOptions(): string[] {
  return [...BOOLEAN_OPTIONS];
}

export function validateIntakeValue(
  type: IntakeFieldType,
  value: string,
  options?: string[] | null,
): IntakeValidation {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true };

  switch (type) {
    case "number": {
      const normalised = trimmed.replace(/\s/g, "").replace(",", ".");
      if (!/^\d+(\.\d+)?$/.test(normalised)) {
        return {
          ok: false,
          message: "This must be a number, zero or more. Letters and negative values are not valid.",
        };
      }
      return { ok: true };
    }
    case "date": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return { ok: false, message: "This must be a date in the form YYYY-MM-DD." };
      }
      const parsed = new Date(`${trimmed}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || !parsed.toISOString().startsWith(trimmed)) {
        return { ok: false, message: "This is not a real calendar date." };
      }
      return { ok: true };
    }
    case "select": {
      const allowed = options ?? [];
      if (allowed.length && !allowed.includes(trimmed)) {
        return { ok: false, message: `Choose one of: ${allowed.join(", ")}.` };
      }
      return { ok: true };
    }
    case "boolean": {
      if (!BOOLEAN_OPTIONS.includes(trimmed)) {
        return { ok: false, message: "Answer with Yes or No." };
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}