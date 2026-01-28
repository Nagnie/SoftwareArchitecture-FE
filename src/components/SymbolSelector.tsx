import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickers, getIconUrl, type TickerData } from '@/services/market';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SymbolSelectorProps {
  currentSymbol: string;
  baseAsset?: string;
}

// Lazy load image component
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageSrc(src);
          observer.unobserve(entries[0].target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <>
      {imageSrc ? (
        <img ref={imgRef} src={imageSrc} alt={alt} className={className} />
      ) : (
        <div ref={imgRef} className={cn(className, 'rounded bg-gray-200')} />
      )}
    </>
  );
};

export const SymbolSelector = ({ currentSymbol, baseAsset }: SymbolSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [allTickers, setAllTickers] = useState<TickerData[]>([]);
  const [displayedTickers, setDisplayedTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Load all tickers once when popover opens
  useEffect(() => {
    if (open && allTickers.length === 0) {
      requestAnimationFrame(() => setLoading(true));
      getAllTickers()
        .then((tickers) => {
          setAllTickers(tickers);
          setDisplayedTickers(tickers.slice(0, 10)); // Load first 10
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, allTickers.length]);

  // Filter tickers based on search
  useEffect(() => {
    let filtered = allTickers;
    if (searchQuery) {
      filtered = allTickers.filter(
        (t) =>
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.baseAsset?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    requestAnimationFrame(() => setDisplayedTickers(filtered.slice(0, 10)));
  }, [searchQuery, allTickers]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Trigger when within 50px of bottom
    if (scrollHeight - scrollTop - clientHeight < 50) {
      const currentLength = displayedTickers.length;
      let filtered = allTickers;
      if (searchQuery) {
        filtered = allTickers.filter(
          (t) =>
            t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.baseAsset?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (currentLength < filtered.length) {
        setDisplayedTickers(filtered.slice(0, currentLength + 10));
      }
    }
  };

  const handleSelectSymbol = (tickerData: TickerData) => {
    navigate(`/markets/price-chart/${tickerData.baseAsset}/${tickerData.symbol}`);
    setOpen(false);
    setSearchQuery('');
  };

  const baseQuote = currentSymbol?.split(baseAsset!)[1] || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='group flex cursor-pointer items-center gap-3'>
          <div className='flex items-center gap-2'>
            <img src={getIconUrl(currentSymbol)} alt={currentSymbol} className='h-8 w-8' />
            <h2 className='text-base font-bold'>
              {baseAsset}/{baseQuote}
            </h2>
            <ChevronDown
              className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-62.5 p-0' align='start'>
        <Command>
          <CommandInput
            placeholder='Search symbol...'
            className='border-b'
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>{loading ? 'Loading...' : 'No symbol found.'}</CommandEmpty>
          <div onScroll={handleScroll} className='max-h-75 overflow-y-auto'>
            <CommandGroup heading='Available Symbols'>
              {displayedTickers.map((ticker) => (
                <CommandItem key={ticker.symbol} value={ticker.symbol} onSelect={() => handleSelectSymbol(ticker)}>
                  <div className='flex items-center gap-2'>
                    <LazyImage src={getIconUrl(ticker.symbol)} alt={ticker.symbol} className='h-4 w-4' />
                    <span>{ticker.symbol}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
