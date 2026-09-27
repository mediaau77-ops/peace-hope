import { useRef, useCallback } from 'react';

/**
 * Hook for hidden administrative trigger on the site logo.
 * Hold the logo for 15 seconds continuously (via mouse pointer, touch, or keyboard Enter/Space).
 * Normal clicks behave as normal links.
 * No visual hint (no progress bar, no tooltip, no cursor alteration).
 * If user releases early, cancels, or moves pointer away, timer resets silently.
 * Does not log to console or reveal the destination in DOM.
 */
export function useLongPressLogo(onTrigger: () => void, holdTimeMs: number = 15000) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const keyHoldingRef = useRef(false);

  const startHold = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    isHoldingRef.current = true;
    timerRef.current = setTimeout(() => {
      isHoldingRef.current = false;
      keyHoldingRef.current = false;
      timerRef.current = null;

      // Small vibration confirmation if supported
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate([60, 40, 60]);
        } catch {
          // ignore
        }
      }

      onTrigger();
    }, holdTimeMs);
  }, [onTrigger, holdTimeMs]);

  const cancelHold = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isHoldingRef.current = false;
    keyHoldingRef.current = false;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return; // Only primary button
      startHold();
    },
    [startHold]
  );

  const onPointerUp = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  const onPointerLeave = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  const onPointerCancel = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !keyHoldingRef.current) {
        keyHoldingRef.current = true;
        startHold();
      }
    },
    [startHold]
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        keyHoldingRef.current = false;
        cancelHold();
      }
    },
    [cancelHold]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
  };
}
