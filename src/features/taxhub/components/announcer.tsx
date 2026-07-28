import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * One polite live region for the whole shell. Toasts are visual only; every
 * state change that raises a toast is also spoken here, so a screen-reader
 * user is told the same thing at the same moment.
 */
const AnnouncerContext = createContext<(message: string) => void>(() => {});

export function useAnnounce() {
  return useContext(AnnouncerContext);
}

export function Announcer({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const announce = useCallback((next: string) => {
    // Re-announce an identical message by clearing first, otherwise the
    // region's text is unchanged and nothing is spoken.
    setMessage("");
    requestAnimationFrame(() => setMessage(next));
  }, []);

  const value = useMemo(() => announce, [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </p>
    </AnnouncerContext.Provider>
  );
}
