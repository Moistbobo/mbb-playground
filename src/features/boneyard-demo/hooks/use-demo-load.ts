import { useCallback, useEffect, useRef, useState } from 'react';

export type DemoPhase = 'loading' | 'ready';

export function useDemoLoad(delayMs = 1600): { phase: DemoPhase; replay: () => void } {
  const [phase, setPhase] = useState<DemoPhase>('loading');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReady = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPhase('ready');
    }, delayMs);
  }, [delayMs]);

  useEffect(() => {
    scheduleReady();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scheduleReady]);

  const replay = useCallback(() => {
    setPhase('loading');
    scheduleReady();
  }, [scheduleReady]);

  return { phase, replay };
}
