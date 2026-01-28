import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ usernameOrEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
        console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className='relative flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-neutral-50 via-neutral-200 to-indigo-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden opacity-30'>
        <div className='absolute top-20 left-20 h-96 w-96 animate-pulse rounded-full bg-purple-500 blur-3xl'></div>
        <div
          className='absolute right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-blue-500 blur-3xl'
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className='absolute top-1/2 left-1/2 h-96 w-96 animate-pulse rounded-full bg-indigo-500 blur-3xl'
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
      <div className='flex items-center gap-2 absolute top-10 left-10 cursor-pointer' onClick={() => navigate('/')}>
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
      <Card className='w-90 border-white/10 bg-white/50 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-500/20 dark:bg-white/5'>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='username'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Username or Email
              </Label>
              <Input
                id='username'
                type='text'
                placeholder='johndoe'
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Password
              </Label>
              <Input
                id='password'
                type='password'
                placeholder='********'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className='text-sm text-red-500'>{error}</p>}
            <Button type='submit' className='w-full'>
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-muted-foreground text-sm'>
            Don't have an account?{' '}
            <Link to='/signup' className='text-primary hover:underline'>
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
