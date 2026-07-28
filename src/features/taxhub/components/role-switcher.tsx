import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTaxhub, useTaxhubActions } from "../use-taxhub";
import { useAnnounce } from "./announcer";

/**
 * Demonstration control. There is no authentication in this prototype: the
 * signed-in user is a stored flag the server reads on every authority check,
 * so switching here changes what the server permits, not only what is shown.
 */
export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { users, currentUser } = useTaxhub();
  const { setDemoUser } = useTaxhubActions();
  const announce = useAnnounce();

  const switchTo = (userId: string) => {
    const next = users.find((u) => u.id === userId);
    if (!next || next.id === currentUser.id) return;
    setDemoUser.mutate(
      { userId },
      {
        onSuccess: () => {
          const message = `Signed in as ${next.name}, ${next.role}. ${
            next.canApprove
              ? "This user may approve outgoing correspondence."
              : "This user may prepare but not approve."
          }`;
          toast.success(message);
          announce(message);
        },
        onError: (error) => {
          toast.error(error.message);
          announce(error.message);
        },
      },
    );
  };

  return (
    <div className={cn("min-w-0", compact ? "px-4 pb-3" : "")}>
      <label
        htmlFor={compact ? "role-switcher-shell" : "role-switcher"}
        className="block text-[11px] font-medium text-text-tertiary"
      >
        Demonstration control · signed in as
      </label>
      <select
        id={compact ? "role-switcher-shell" : "role-switcher"}
        value={currentUser.id}
        disabled={setDemoUser.isPending}
        onChange={(e) => switchTo(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border-default bg-surface px-2 py-1.5 text-xs text-text-primary"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} — {user.role}
            {user.canApprove ? " (may approve)" : " (may not approve)"}
          </option>
        ))}
      </select>
      {!compact ? (
        <p className="mt-2 text-xs text-text-secondary">
          Not a login. There are no passwords and no authentication in this prototype. The choice is
          stored server-side and every approval check reads it there, so as a preparer the server
          refuses an approval even if the request is made directly.
        </p>
      ) : null}
    </div>
  );
}
