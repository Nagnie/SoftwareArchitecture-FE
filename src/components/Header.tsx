import { ModeToggle } from '@/components/ModeToggle';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useShortcut } from '@/hooks/useShortcut';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onUpdateSearch?: (query: string) => void;
}

export const Header = ({ onUpdateSearch }: HeaderProps) => {
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const isLoggedIn = true; // Giả sử trạng thái đăng nhập được xác định ở đây

  const searchRef = useRef<HTMLInputElement>(null);

  useShortcut(['ctrl', 'k'], () => {
    searchRef.current?.focus();
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

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onUpdateSearch) {
      onUpdateSearch(search);
    }
  };

  return (
    <header className='z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6'>
      {/* Logo and Nav */}
      <div className='flex shrink-0 items-center gap-8'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
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
        <InputGroup className='w-full'>
          <InputGroupInput
            placeholder='Search...'
            ref={searchRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onKeyDown={handleEnterPress}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          {/* <InputGroupAddon align='inline-end'>12 results</InputGroupAddon> */}
          <InputGroupAddon align='inline-end'>
            <span className='bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-xs font-medium'>
              ⌘K
            </span>
          </InputGroupAddon>
        </InputGroup>
      </div>
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
