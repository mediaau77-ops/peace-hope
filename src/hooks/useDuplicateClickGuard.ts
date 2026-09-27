import { useState, useCallback } from 'react';

/**
 * Hook to guard against duplicate button clicks across user sessions.
 * Stores action tokens in localStorage and tracks temporary in-memory debounce.
 */
export function useDuplicateClickGuard(scope: string) {
  const getKey = (itemId: string, actionType: string) => `ph_acted_${scope}_${itemId}_${actionType}`;

  const hasActed = useCallback(
    (itemId: string, actionType: string = 'default'): boolean => {
      if (typeof window === 'undefined') return false;
      try {
        return Boolean(localStorage.getItem(getKey(itemId, actionType)));
      } catch {
        return false;
      }
    },
    [scope]
  );

  const [inFlight, setInFlight] = useState<Record<string, boolean>>({});

  const executeGuarded = useCallback(
    async (
      itemId: string,
      actionType: string = 'default',
      asyncAction: () => Promise<void>
    ): Promise<boolean> => {
      const key = `${itemId}_${actionType}`;
      if (hasActed(itemId, actionType) || inFlight[key]) {
        return false;
      }

      setInFlight((prev) => ({ ...prev, [key]: true }));

      try {
        await asyncAction();
        try {
          localStorage.setItem(getKey(itemId, actionType), 'true');
        } catch {
          // ignore
        }
        return true;
      } catch (err) {
        console.debug('Error executing guarded action:', err);
        return false;
      } finally {
        setInFlight((prev) => ({ ...prev, [key]: false }));
      }
    },
    [hasActed, inFlight, scope]
  );

  return { hasActed, executeGuarded, inFlight };
}
