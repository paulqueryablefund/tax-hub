import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Sign in — TaxHub" },
      {
        name: "description",
        content: "TaxHub is a private demonstration workspace. Sign in with the team credentials.",
      },
      { property: "og:title", content: "Sign in — TaxHub" },
      {
        property: "og:description",
        content: "TaxHub is a private demonstration workspace. Sign in with the team credentials.",
      },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(false);
    try {
      const { ok } = await unlock({
        data: {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      });
      if (ok) {
        await router.invalidate();
        await router.navigate({ to: "/" });
        return;
      }
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-10 text-text-primary">
      <div className="w-full max-w-sm">
        <p className="font-serif text-2xl leading-tight font-medium">TaxHub</p>
        <p className="mt-1 text-sm text-text-secondary">
          A private demonstration workspace for the team. Sign in to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-status-danger">
              Those details are not correct.
            </p>
          ) : null}
          <Button type="submit" disabled={pending || !ready} className="w-full">
            {pending ? "Signing in…" : ready ? "Sign in" : "Loading…"}
          </Button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-text-tertiary">
          Signing in only opens the workspace. Inside, the product continues to run as the
          demonstration user Miriam Radtke; all firm, client and document data is fictional.
        </p>
      </div>
    </div>
  );
}