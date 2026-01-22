import { getAllTickers, type TickerData } from '@/services/market';
import { useEffect, useState } from 'react';

interface UseSearchMarketReturn {
  data: TickerData[];
  isLoading: boolean;
  error: string | null;
}

export const useSearchMarket = (query: string, enabled: boolean = true): UseSearchMarketReturn => {
  const [data, setData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !query.trim()) {
      setData([]);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allTickers = await getAllTickers();

        // Simple fuzzy search
        const lowerQuery = query.toLowerCase();
        const filtered = allTickers.filter(
          (ticker) =>
            ticker.symbol.toLowerCase().includes(lowerQuery) || ticker.baseAsset?.toLowerCase().includes(lowerQuery)
        );

        setData(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [query, enabled]);

  return { data, isLoading, error };
};
