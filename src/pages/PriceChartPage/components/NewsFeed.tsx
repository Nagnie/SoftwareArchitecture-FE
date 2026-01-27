import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsItem } from './NewsItem';
import { useInfiniteNews } from '@/hooks/useInfiniteNews';

export interface NewsFeedProps {
  symbol?: string;
}

export const NewsFeed = ({ symbol }: NewsFeedProps) => {
  const { news, isLoading, hasMore, error, observerTarget, retry } = useInfiniteNews({
    symbol,
    pageSize: 10
  });

  return (
    <div className='flex flex-col gap-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-bold'>Smart News Feed</h3>
        <button className='text-primary text-xs hover:underline'>View All</button>
      </div>

      {/* Error State */}
      {error && (
        <div className='flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3'>
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium text-red-700 dark:text-red-400'>Failed to load news</p>
            <p className='mt-1 text-xs text-red-600 dark:text-red-300'>{error}</p>
          </div>
          <Button size='sm' variant='outline' onClick={retry} className='h-7 flex-shrink-0 text-xs'>
            Retry
          </Button>
        </div>
      )}

      {/* News Items */}
      <div className='scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent scrollbar-hidden flex max-h-[600px] flex-col gap-3 overflow-y-auto'>
        {news.length === 0 && !isLoading && !error && (
          <div className='flex h-[200px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'>
            <div className='text-center'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-300'>No news available</p>
            </div>
          </div>
        )}

        {news.map((newsItem) => (
          <NewsItem key={newsItem._id} news={newsItem} />
        ))}

        {/* Loading State & Observer Target */}
        <div ref={observerTarget} className='flex justify-center py-4'>
          {isLoading && (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin text-slate-500' />
              <p className='text-xs text-slate-500'>Loading more news...</p>
            </div>
          )}
          {!hasMore && news.length > 0 && <p className='text-xs text-slate-500'>No more news to load</p>}
        </div>
      </div>
    </div>
  );
};
