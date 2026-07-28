import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, Panel, formatDate } from "@/features/taxhub/components/primitives";
import {
  AREA_GLOSS,
  AREA_NAMES,
  HUB,
  MICROCOPY,
  STEP_TOURS,
  WORKFLOW_ORDER,
} from "@/features/taxhub/tour/tour-content";
import { useTour } from "@/features/taxhub/tour/tour-provider";
import { displayStatus } from "@/features/taxhub/tour/tour-state";

export const Route = createFileRoute("/tour")({
  head: () => ({
    meta: [
      { title: "Guided tour — Werk Flow" },
      {
        name: "description",
        content:
          "Every area walkthrough, the full tour in workflow order, and a narrated replay of one complete case from arrival to approval.",
      },
      { property: "og:title", content: "Guided tour — Werk Flow" },
      {
        property: "og:description",
        content:
          "Area walkthroughs, the full tour in workflow order, and a narrated replay of one complete case.",
      },
    ],
  }),
  component: TourHub,
});

function TourHub() {
  const tour = useTour();
  const { state, hydrated } = tour;

  const fullInProgress = hydrated && state.full.active;
  const fullArea = WORKFLOW_ORDER[Math.min(state.full.areaIndex, WORKFLOW_ORDER.length - 1)];
  const fullAreaState = state.areas[fullArea];
  const allComplete =
    hydrated && WORKFLOW_ORDER.every((a) => state.areas[a]?.tourStatus === "completed");

  return (
    <div className="space-y-6">
      <PageHeader tourId="tour.header" title={HUB.title} description={HUB.subtitle} />

      <p className="max-w-3xl text-sm text-text-secondary">{HUB.intro}</p>

      <div data-tour="tour.full-tour">
        <Panel title={HUB.fullTour.title}>
          <p className="text-sm text-text-primary">{HUB.fullTour.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => tour.startFull({ resume: fullInProgress })}>
              {fullInProgress ? HUB.fullTour.resume : HUB.fullTour.start}
            </Button>
            {fullInProgress ? (
              <>
                <Button variant="outline" onClick={() => tour.startFull()}>
                  {MICROCOPY.fullResume.startOver}
                </Button>
                <Button variant="ghost" onClick={tour.clearFullTour}>
                  {MICROCOPY.fullResume.clear}
                </Button>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            {fullInProgress
              ? HUB.fullTour.at(
                  AREA_NAMES[fullArea],
                  state.full.stepIndex + 1,
                  fullAreaState?.lastStepTotal || STEP_TOURS[fullArea].length,
                )
              : HUB.fullTour.notStarted}
          </p>
        </Panel>
      </div>

      <div data-tour="tour.replay">
        <Panel title={HUB.replay.title}>
          <p className="text-sm text-text-primary">{HUB.replay.body}</p>
          <p className="mt-2 text-sm text-text-secondary">{HUB.replay.duration}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => tour.startReplay()}>{HUB.replay.start}</Button>
            <Button variant="outline" onClick={() => tour.startReplay({ manual: true })}>
              {HUB.replay.manual}
            </Button>
          </div>
          {state.replay.lastCompletedAt ? (
            <p className="mt-2 text-xs text-text-secondary">
              {HUB.replay.lastRun(formatDate(state.replay.lastCompletedAt))}
            </p>
          ) : null}
        </Panel>
      </div>

      <div data-tour="tour.areas">
        <Panel title={HUB.areas.title} description={HUB.areas.body}>
          {allComplete ? (
            <p className="mb-3 rounded-sm border border-source-verified/30 bg-source-verified-bg px-3 py-2 text-sm text-source-verified">
              <span className="font-medium">{MICROCOPY.allComplete.title}</span>{" "}
              {MICROCOPY.allComplete.body}
            </p>
          ) : null}
          <ul className="divide-y divide-border-subtle">
            {WORKFLOW_ORDER.map((area) => {
              const areaState = state.areas[area];
              const status = displayStatus(areaState);
              const total = areaState.lastStepTotal || STEP_TOURS[area].length;
              return (
                <li
                  key={area}
                  className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0"
                >
                  <div className="min-w-0 max-w-xl">
                    <p className="text-sm font-medium">{AREA_NAMES[area]}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{AREA_GLOSS[area]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-medium">
                      {MICROCOPY.statusLabels[status]}
                    </span>
                    {status === "in_progress" ? (
                      <span className="text-[11px] text-text-secondary">
                        {MICROCOPY.statusSecondary.in_progress(areaState.lastStepIndex + 1, total)}
                      </span>
                    ) : null}
                    {status === "completed" && areaState.completedAt ? (
                      <span className="text-[11px] text-text-secondary">
                        {MICROCOPY.statusSecondary.completed(formatDate(areaState.completedAt))}
                      </span>
                    ) : null}
                    {status === "dismissed" ? (
                      <span className="text-[11px] text-text-secondary">
                        {MICROCOPY.statusSecondary.dismissed}
                      </span>
                    ) : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          tour.startArea(area, {
                            fromStep: status === "in_progress" ? areaState.lastStepIndex : 0,
                          })
                        }
                      >
                        {status === "in_progress"
                          ? MICROCOPY.rowActions.resume
                          : status === "completed"
                            ? MICROCOPY.rowActions.restart
                            : MICROCOPY.rowActions.start}
                      </Button>
                      {status === "in_progress" || status === "completed" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => tour.startArea(area, { fromStep: 0 })}
                        >
                          {MICROCOPY.restartArea}
                        </Button>
                      ) : null}
                      {status === "dismissed" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => tour.setAreaDismissed(area, false)}
                        >
                          {MICROCOPY.rowActions.showPopup}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-text-tertiary">{HUB.areas.footer}</p>
        </Panel>
      </div>

      <div data-tour="tour.reset">
        <Panel title={HUB.reset.title}>
          <p className="text-sm text-text-primary">{HUB.reset.all}</p>
          <div className="mt-2">
            <ResetAllDialog onConfirm={tour.resetAllTourProgress} />
          </div>
          <p className="mt-4 text-sm text-text-primary">{HUB.reset.popups}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={tour.restoreDismissedPopups}
          >
            {HUB.reset.popupsButton}
          </Button>
          <p className="mt-4 text-xs text-text-tertiary">{HUB.reset.note}</p>
        </Panel>
      </div>

      <Panel title={HUB.welcome.title}>
        <p className="text-sm text-text-primary">{HUB.welcome.body}</p>
        <Button variant="outline" className="mt-3" onClick={() => tour.openWelcome("returning")}>
          {HUB.welcome.button}
        </Button>
      </Panel>
    </div>
  );
}

function ResetAllDialog({ onConfirm }: { onConfirm: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">{MICROCOPY.resetAll}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{MICROCOPY.resetDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {MICROCOPY.resetDialog.body} {MICROCOPY.resetDialog.body2}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{MICROCOPY.resetDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirm();
                setDone(true);
              }}
            >
              {MICROCOPY.resetDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {done ? (
        <p role="status" className="mt-2 text-xs text-status-success">
          Tour progress cleared. Cases, drafts, sources and the audit trail are untouched.
        </p>
      ) : null}
    </>
  );
}