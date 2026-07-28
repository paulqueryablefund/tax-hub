import { CircleHelp } from "lucide-react";
import { MICROCOPY, type AreaId } from "./tour-content";
import { useOptionalTour } from "./tour-provider";

/**
 * Contextual re-entry (§5.9 / step 5). Present in every page header that
 * carries a tour anchor, and it works regardless of any dismissal or of
 * the global off switch — turning off automatic help must never mean
 * losing access to help.
 */
export function AreaHelpButton({ anchor }: { anchor: string }) {
  const tour = useOptionalTour();
  if (!tour) return null;
  const area = anchor.split(".")[0] as AreaId;

  return (
    <button
      type="button"
      title={MICROCOPY.helpTooltip}
      aria-label={MICROCOPY.helpTooltip}
      data-tour={`${area}.help-control`}
      onClick={() => tour.startArea(area)}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border-default text-text-secondary hover:bg-subtle hover:text-text-primary"
    >
      <CircleHelp aria-hidden className="size-4" />
    </button>
  );
}