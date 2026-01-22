import { useSearchMarket } from '@/hooks/useSearchMarket';
import { cn, formatCurrency } from '@/lib/utils';
import { getIconUrl, type TickerData } from '@/services/market';
import { Loader2, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';

interface MarketSearchBarProps {
  onTickerSelect?: (ticker: TickerData) => void;
  onViewAll?: (query: string) => void;
  className?: string;
  initialQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const MarketSearchBar = ({
  onTickerSelect,
  onViewAll,
  className,
  initialQuery = '',
  onSearchChange
}: MarketSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const isInitialMount = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initialQuery prop
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { data: searchResults, isLoading } = useSearchMarket(query, query.length >= 1 && open);

  useEffect(() => {
    if (!isInitialMount.current && query.length >= 1) {
      setOpen(true);
    } else if (query.length < 1) {
      setOpen(false);
      // Khi xóa search, reset filter ở table
      onViewAll?.('');
    }
  }, [query, onViewAll]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      onViewAll?.(query);
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  };

  const handleFocus = () => {
    if (!isInitialMount.current && query.length >= 1) {
      setOpen(true);
    }
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  };

  const isPositiveChange = (changePercent: string) => {
    return parseFloat(changePercent) >= 0;
  };

  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <Command className='rounded-lg border shadow-md' shouldFilter={false}>
        <CommandInput
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={inputRef as any}
          placeholder='Search coins...'
          value={query}
          onValueChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />

        {open && (
          <CommandList
            ref={dropdownRef}
            className='bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-96 rounded-md border shadow-lg'
          >
            {isLoading && (
              <div className='flex flex-col items-center justify-center p-8'>
                <Loader2 className='text-muted-foreground mb-2 h-6 w-6 animate-spin' />
                <p className='text-muted-foreground text-sm'>Searching...</p>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && (
              <CommandEmpty>
                <div className='flex flex-col items-center py-6'>
                  <Search className='text-muted-foreground mb-2 h-8 w-8 opacity-50' />
                  <p className='text-sm font-medium'>No coins found</p>
                  <p className='text-muted-foreground text-xs'>Try different keywords</p>
                </div>
              </CommandEmpty>
            )}

            {!isLoading && searchResults.length > 0 && (
              <>
                <CommandGroup heading='Search Results'>
                  {searchResults.slice(0, 8).map((ticker) => (
                    <CommandItem
                      key={ticker.symbol}
                      value={ticker.symbol}
                      onSelect={() => {
                        onTickerSelect?.(ticker);
                        setOpen(false);
                      }}
                      className='cursor-pointer'
                    >
                      <div className='flex min-w-0 flex-1 items-center gap-3'>
                        <img
                          src={getIconUrl(ticker.symbol)}
                          alt={ticker.symbol}
                          className='h-6 w-6 shrink-0 rounded-full'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                          <span className='truncate text-sm font-semibold'>{ticker.symbol}</span>
                          {ticker.baseAsset && <p className='text-muted-foreground text-xs'>{ticker.baseAsset}</p>}
                        </div>
                      </div>

                      <div className='ml-2 flex shrink-0 items-center gap-2'>
                        <div className='text-right'>
                          <p className='font-mono text-sm font-semibold'>{formatCurrency(ticker.lastPrice)}</p>
                          <p
                            className={`flex items-center gap-1 font-mono text-xs ${
                              isPositiveChange(ticker.priceChangePercent) ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {isPositiveChange(ticker.priceChangePercent) ? (
                              <TrendingUp className='h-3 w-3' />
                            ) : (
                              <TrendingDown className='h-3 w-3' />
                            )}
                            {ticker.priceChangePercent}%
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {searchResults.length > 8 && (
                  <>
                    <CommandSeparator />
                    <CommandItem
                      onSelect={() => {
                        onViewAll?.(query);
                        setOpen(false);
                      }}
                      className='text-primary cursor-pointer justify-center'
                    >
                      <Search className='mr-2 h-4 w-4' />
                      View all {searchResults.length} results for "{query}"
                    </CommandItem>
                  </>
                )}
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
};
