import { ModeToggle } from '@/components/ModeToggle';
import { MarketSearchBar } from '@/pages/OverviewPage/components/MarketSearchBar';
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
import type { TickerData } from '@/services/market';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onUpdateSearch?: (query: string) => void;
  onTickerSelect?: (ticker: TickerData) => void;
}

export const Header = ({ onUpdateSearch, onTickerSelect }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  useShortcut(['ctrl', 'k'], () => {
    // Focus sẽ được xử lý bởi MarketSearchBar
  });

  useShortcut(['ctrl', 'q'], () => {
    if (isAuthenticated) {
      handleLogout();
    }
  });

  useShortcut(['ctrl', 'p'], () => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className='z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-12'>
      {/* Logo and Nav */}
      <div className='flex shrink-0 items-center gap-8'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <div className='flex size-10 items-center justify-center rounded-md'>
            <img src='/logo.png' alt='Logo' />
          </div>
          <div>
            <h1 className='text-lg leading-none font-bold tracking-tight text-neutral-900 dark:text-white'>
              Crypto
              <span className='bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
                AI
              </span>
            </h1>
          </div>
        </div>
        {/* Nav */}
        <nav className='flex items-center gap-1'>
          <NavLink
            to='/markets/overview'
            className={({ isActive }) =>
              isActive
                ? buttonVariants({ variant: 'secondary', className: 'hover:bg-secondary!' })
                : buttonVariants({ variant: 'ghost' })
            }
          >
            Markets
          </NavLink>
        </nav>
      </div>
      {/* Search */}
      <div className='flex max-w-xl flex-1 justify-center'>
        <MarketSearchBar onViewAll={onUpdateSearch} onTickerSelect={onTickerSelect} />
      </div>
      {/* User Account and Mode Toggle */}
      <div className='flex shrink-0 items-center gap-1'>
        {isAuthenticated && user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className='outline-none'>
                <Link to='/' className='flex items-center gap-3 rounded-lg p-1'>
                  <div className='flex flex-col items-end sm:flex'>
                    <span className='text-sm leading-none font-medium'>{user.fullName}</span>
                    <span className='text-primary mt-1 text-xs font-medium'>
                      {user.vipExpiryDate ? 'VIP Plan' : 'Regular Plan'}
                    </span>
                  </div>
                  <div className='size-9 rounded-full border bg-cover bg-center shadow-sm'>
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
                  <DropdownMenuItem className='cursor-pointer' onClick={handleProfile}>
                    Profile
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className='cursor-pointer' onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
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
