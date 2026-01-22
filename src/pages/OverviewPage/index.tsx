import { Header } from '@/components/Header';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCompact, formatCurrency } from '@/lib/utils';
import { ArrowUpDown, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type MarketFilter = 'all' | 'gainers' | 'volume';

const PriceCell = ({ price }: { price: string }) => {
  const prevPriceRef = useRef<number>(parseFloat(price));
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const currentPrice = parseFloat(price);
    if (prevPriceRef.current !== currentPrice) {
      if (timerRef.current) window.clearTimeout(timerRef.current);

      // defer state update
      const direction = currentPrice > prevPriceRef.current ? 'up' : 'down';
      requestAnimationFrame(() => setFlash(direction));

      prevPriceRef.current = currentPrice;
      timerRef.current = window.setTimeout(() => setFlash(null), 400);
    }
  }, [price]);

  return (
    <span
      className={`font-mono text-sm font-bold transition-all duration-300 ${
        flash === 'up'
          ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
          : flash === 'down'
            ? 'scale-110 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            : ''
      }`}
    >
      {formatCurrency(price)}
    </span>
  );
};

export const OverviewPage = () => {
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const isPositive = true; // Placeholder for demonstration
  const totalPages = 10; // Placeholder for demonstration

  return (
    <div>
      <Header />

      <main className='mx-auto mt-8 flex max-w-7xl flex-col gap-8 px-4'>
        {/* Title And Filter */}
        <div className='flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-end'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-black tracking-tight'>Market Crypto</h1>
            </div>
            <p className='text-muted-foreground text-sm font-medium'>
              Track real-time price movements and trading volumes.
            </p>
          </div>

          <div className='flex w-full flex-col items-center gap-4 sm:flex-row xl:w-auto'>
            {/* Tabs Filter */}
            <div className='bg-card flex w-full rounded-2xl border p-1 sm:w-auto'>
              <button
                onClick={() => {
                  setFilter('all');
                  setCurrentPage(1);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-black transition-all sm:flex-none ${
                  filter === 'all' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                All Assets
              </button>
              <button
                onClick={() => {
                  setFilter('gainers');
                  setCurrentPage(1);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-black transition-all sm:flex-none ${
                  filter === 'gainers' ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <TrendingUp className='h-3.5 w-3.5' /> Top Gainers
              </button>
              <button
                onClick={() => {
                  setFilter('volume');
                  setCurrentPage(1);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-black transition-all sm:flex-none ${
                  filter === 'volume' ? 'bg-blue-500/10 text-blue-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Zap className='h-3.5 w-3.5' /> Top Volume
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div>
          {/* Table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='cursor-pointer text-[10px] font-black tracking-[0.2em] uppercase transition-colors select-none hover:text-slate-300'>
                    <div className='flex items-center gap-2'>
                      Asset <ArrowUpDown className='h-3 w-3 opacity-30' />
                    </div>
                  </TableHead>
                  <TableHead className='cursor-pointer text-[10px] font-black tracking-[0.2em] uppercase transition-colors select-none hover:text-slate-300'>
                    <div className='flex items-center gap-2'>
                      Price <ArrowUpDown className='h-3 w-3 opacity-30' />
                    </div>
                  </TableHead>
                  <TableHead className='cursor-pointer text-[10px] font-black tracking-[0.2em] uppercase transition-colors select-none hover:text-slate-300'>
                    <div className='flex items-center gap-2'>
                      24h Change <ArrowUpDown className='h-3 w-3 opacity-30' />
                    </div>
                  </TableHead>
                  <TableHead className='cursor-pointer text-[10px] font-black tracking-[0.2em] uppercase transition-colors select-none hover:text-slate-300'>
                    <div className='flex items-center gap-2'>
                      24h Volume <ArrowUpDown className='h-3 w-3 opacity-30' />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow className='cursor-pointer' key={index}>
                    <TableCell>
                      <div className='group flex items-center gap-4'>
                        <div className='relative'>
                          <div className='flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800 transition-all group-hover:border-blue-500/30'>
                            <img
                              src={'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024'}
                              alt={'btc'}
                              className='h-7 w-7 object-contain transition-transform group-hover:scale-110'
                              onError={(e) =>
                                (e.currentTarget.src = 'https://cryptologos.cc/logos/generic-cryptocurrency-logo.png')
                              }
                            />
                          </div>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-base font-black transition-colors group-hover:text-blue-400'>BTC</span>
                          <span className='text-muted-foreground text-[10px] font-bold tracking-wider'>
                            USDT Marketplace
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriceCell price='27458.23' />
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1.5 text-sm font-black ${
                          isPositive ? 'text-emerald-400' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? <TrendingUp className='h-4 w-4' /> : <TrendingDown className='h-4 w-4' />}
                        {isPositive ? '+' : ''}
                        {1.046}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-mono text-sm font-bold text-slate-400'>{formatCompact(1256345678)}</span>
                        <div className='mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-slate-800'>
                          <div
                            className='h-full bg-blue-500/50'
                            style={{
                              width: `${Math.min(100, (parseFloat('1256345678') / 1000000000) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className='flex flex-col items-center justify-between gap-6 py-6 md:flex-row'>
            <div className='flex items-center gap-6'>
              <div className='flex flex-col'>
                <span className='text-[9px] font-black tracking-widest uppercase'>Total Assets</span>
                <span className='text-sm font-black'>10</span>
              </div>
              <Separator orientation='vertical' className='!h-8' />
              <div className='flex flex-col'>
                <span className='text-[9px] font-black tracking-widest uppercase'>Page</span>
                <span className='text-sm font-black'>
                  {currentPage} / {totalPages || 1}
                </span>
              </div>
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href='#' />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#'>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#' isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#'>3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href='#' />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
