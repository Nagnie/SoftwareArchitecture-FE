import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { New } from '@/services/news';

export interface NewsItemProps {
  news: New;
}

export const NewsItem = ({ news }: NewsItemProps) => {
  const publishedDate = new Date(news.published_at);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <Card className='gap-2 gap-y-0 py-4 transition-all hover:shadow-lg dark:hover:shadow-slate-900'>
      <CardHeader className='px-4 pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              {news.source}
            </span>
            <h4 className='mt-1 line-clamp-2 text-sm font-bold wwrap-break-words'>{news.title}</h4>
          </div>
          <a
            href={news.url}
            target='_blank'
            rel='noopener noreferrer'
            className='shrink-0 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300'
            title='Open article'
          >
            <ExternalLink className='h-4 w-4' />
          </a>
        </div>
      </CardHeader>
      <CardContent className='px-4'>
        <p className='mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300'>
          {news.summary || 'No summary available'}
        </p>

        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap gap-1'>
            {news.tags &&
              news.tags.length > 0 &&
              news.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className='inline-block rounded bg-slate-700/40 px-2 py-1 text-[10px] text-slate-100 dark:bg-slate-700/60'
                >
                  #{tag}
                </span>
              ))}
            {news.tags && news.tags.length > 3 && (
              <span className='text-[10px] text-slate-400'>+{news.tags.length - 3} more</span>
            )}
          </div>
          <span className='shrink-0 text-[10px] text-slate-500 dark:text-slate-400'>{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
};
