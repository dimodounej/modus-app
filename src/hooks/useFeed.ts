import { useState, useCallback } from 'react';
import { fetchFeed } from '../lib/api';
import type { FeedItem } from '../types';

export function useFeed() {
  const [items, setItems]       = useState<FeedItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetchFeed();
      setItems(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const removeFeedItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, loading, refreshing, load, removeFeedItem };
}
