import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { browserClient } from '@/sanity/lib/client';

interface UseLiveContentSubscriptionOptions<T> {
  query: string;
  params?: Record<string, any>;
  initialData?: T | null;
  enabled?: boolean;
  onUpdate?: (data: T) => void;
}

export function useLiveContentSubscription<T>({
  query,
  params = {},
  initialData = null,
  enabled = true,
  onUpdate
}: UseLiveContentSubscriptionOptions<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [syncTags, setSyncTags] = useState<string[]>([]);
  const subscriptionRef = useRef<any>(null);

  // Memoize params to prevent unnecessary re-fetches
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchData = useCallback(async (lastLiveEventId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await browserClient.fetch(
        query,
        memoizedParams,
        { 
          filterResponse: false, 
          lastLiveEventId 
        }
      );

      // Store sync tags for real-time updates
      if (response.syncTags) {
        setSyncTags(response.syncTags);
      }

      const result = response.result as T;
      setData(result);
      
      if (onUpdate && result) {
        onUpdate(result);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [query, memoizedParams, onUpdate]);

  // Initial fetch effect
  useEffect(() => {
    if (!enabled) return;
    fetchData();
  }, [enabled, fetchData]);

  // Subscription effect
  useEffect(() => {
    if (!enabled || syncTags.length === 0) return;

    // Subscribe to live updates
    subscriptionRef.current = browserClient.live.events().subscribe(
      (event) => {
        if (event.type === "message" && event.tags.some((tag) => syncTags.includes(tag))) {
          // Refetch with event ID to get latest data
          fetchData(event.id);
        }
        if (event.type === "restart") {
          // A restart event means we need to refetch without lastLiveEventId
          fetchData();
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [enabled, fetchData, syncTags]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData()
  };
}