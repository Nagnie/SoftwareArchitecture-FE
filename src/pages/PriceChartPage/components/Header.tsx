import { ModeToggle } from '@/components/ModeToggle';
import { SymbolSelector } from '@/components/SymbolSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useShortcut } from '@/hooks/useShortcut';
import { type TickerData } from '@/services/market';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';

interface HeaderProps {
  onTickerSelect?: (ticker: TickerData) => void;
  ticker: TickerData | null;
  priceDirection: 'up' | 'down' | null;
}

export const Header = ({ ticker, priceDirection }: HeaderProps) => {
  const { tickerSymbol, baseAsset } = useParams();

  const baseQuote = tickerSymbol?.split(baseAsset!)[1] || '';

  const navigate = useNavigate();

  const isLoggedIn = true; // Giả sử trạng thái đăng nhập được xác định ở đây

  useShortcut(['ctrl', 'k'], () => {
    // Focus sẽ được xử lý bởi MarketSearchBar
  });

  useShortcut(['ctrl', 'q'], () => {
    if (isLoggedIn) {
      navigate('/login');
    }
  });

  useShortcut(['ctrl', 'p'], () => {
    if (isLoggedIn) {
      navigate('/profile');
    }
  });

  // update browser title
  useEffect(() => {
    if (ticker) {
      document.title = `${formatCurrency(ticker.lastPrice)} | ${baseAsset} ${baseQuote}`;
    } else {
      document.title = 'CryptoAI - Price Chart';
    }
  }, [ticker, baseAsset, baseQuote]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className='z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6'>
      {/* Logo and Nav */}
      <div className='flex shrink-0 items-center gap-8'>
        {/* Logo And Symbol Switcher */}
        <div className='flex items-center'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='flex size-10 items-center justify-center rounded-md'>
              <img src='/logo.png' alt='Logo' />
            </div>
            <div>
              <h1 className='text-lg leading-none font-bold tracking-tight text-slate-900 dark:text-white'>
                Crypto
                <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
                  AI
                </span>
              </h1>
            </div>
          </Link>

          <Separator orientation='vertical' className='mx-4 !h-6' />

          {/* Symbol Switcher */}
          <div className='flex items-center gap-3'>
            <SymbolSelector currentSymbol={tickerSymbol!} baseAsset={baseAsset} />
            {ticker && (
              <>
                <Separator orientation='vertical' className='!h-6' />
                <div className='flex min-w-[120px] flex-col'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`origin-left transform font-mono text-xl font-black transition-all duration-200 ${
                        priceDirection === 'up'
                          ? 'scale-110 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                          : priceDirection === 'down'
                            ? 'scale-110 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]'
                            : parseFloat(ticker.priceChangePercent) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-500'
                      }`}
                    >
                      {formatCurrency(ticker.lastPrice)}
                    </span>
                    {priceDirection === 'up' && <TrendingUp className='ml-2 h-5 w-5 animate-pulse text-emerald-400' />}
                    {priceDirection === 'down' && <TrendingDown className='ml-2 h-5 w-5 animate-pulse text-red-500' />}
                  </div>
                  <div className='flex items-center gap-1'>
                    {parseFloat(ticker.priceChangePercent) >= 0 ? (
                      <ArrowUpRight className='h-3 w-3 text-emerald-500' />
                    ) : (
                      <ArrowDownRight className='h-3 w-3 text-red-500' />
                    )}
                    <span
                      className={`text-xs font-black ${
                        parseFloat(ticker.priceChangePercent) >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {parseFloat(ticker.priceChangePercent) > 0 ? '+' : ''}
                      {ticker.priceChangePercent}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Search */}
      {ticker && (
        <div className='flex max-w-xl flex-1 justify-center gap-6'>
          {/* 24h Stats */}
          <div className='flex gap-8'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase'>
                24h High
              </span>
              <span className='font-mono text-sm font-bold'>{formatCurrency(ticker.highPrice)}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase'>
                24h Low
              </span>
              <span className='font-mono text-sm font-bold'>{formatCurrency(ticker.lowPrice)}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase'>
                24h Volume (USDT)
              </span>
              <span className='font-mono text-sm font-bold'>{formatCompactNumber(ticker.quoteVolume)}</span>
            </div>
          </div>
        </div>
      )}
      {/* User Account and Mode Toggle */}
      <div className='flex shrink-0 items-center gap-1'>
        {isLoggedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className='outline-none'>
                <Link to='/' className='flex items-center gap-3 rounded-lg p-1'>
                  <div className='flex flex-col items-end sm:flex'>
                    <span className='text-sm leading-none font-medium'>Alex Trader</span>
                    <span className='text-primary mt-1 text-xs font-medium'>Pro Plan</span>
                  </div>
                  <div className='size-9 rounded-full border-1 bg-cover bg-center shadow-sm'>
                    <Avatar>
                      <AvatarImage src='https://api.dicebear.com/9.x/adventurer/svg?seed=Liliana' />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-40' align='start'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => handleProfile()}>
                    Profile
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => handleLogout()}>
                    Log out
                    <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <div className='mr-2 flex items-center gap-2'>
              <Link to='/login' className={buttonVariants({ variant: 'secondary' })}>
                Log In
              </Link>
              <Link to='/signup' className={buttonVariants()}>
                Sign Up
              </Link>
            </div>
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
};
