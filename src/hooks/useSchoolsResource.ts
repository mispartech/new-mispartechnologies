import { useEffect, useRef, useState, useCallback } from 'react';

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Tiny data-fetching helper for the Schools pages.
 * - Calls `fn` on mount and whenever `deps` change.
 * - Exposes `{ data, loading, error, refetch }`.
 * - Toast notifications come from the underlying `schoolsRequest` — this hook
 *   only owns local state so pages can show inline error UI.
 */
export function useSchoolsResource<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = [],
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (aliveRef.current) setData(result);
    } catch (err) {
      if (aliveRef.current) setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    run();
    return () => { aliveRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
