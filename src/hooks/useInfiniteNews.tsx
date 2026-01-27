import { useCallback, useEffect, useRef, useState } from 'react';
import { getNews, type New } from '@/services/news';
import type { GetNewsParams } from '@/services/news/type';

export interface UseInfiniteNewsOptions {
  symbol?: string;
  pageSize?: number;
}

export const useInfiniteNews = ({ pageSize = 10 }: UseInfiniteNewsOptions = {}) => {
  const [news, setNews] = useState<New[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const observerTarget = useRef<HTMLDivElement>(null);
  const hasErrorRef = useRef(false);

  const fetchNews = useCallback(
    async (pageNum: number) => {
      // Don't auto-retry if there's an error - user must click retry button
      if (hasErrorRef.current && pageNum !== 1) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        hasErrorRef.current = false;

        const params: GetNewsParams = {
          page: pageNum,
          page_size: pageSize
        };

        const response = await getNews(params);

        if (pageNum === 1) {
          setNews(response.data);
        } else {
          setNews((prev) => [...prev, ...response.data]);
        }

        setHasMore(response.meta.has_next);
        setPage(pageNum);
      } catch (err) {
        hasErrorRef.current = true;
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    hasErrorRef.current = false;
    fetchNews(1);
  }, [fetchNews]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !hasErrorRef.current) {
          fetchNews(page + 1);
        }
      },
      {
        rootMargin: '200px'
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, page, fetchNews]);

  const retry = useCallback(() => {
    setNews([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    hasErrorRef.current = false;
    fetchNews(1);
  }, [fetchNews]);

  return {
    news,
    isLoading,
    hasMore,
    error,
    observerTarget,
    retry
  };
};
