import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className='relative flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-neutral-50 via-neutral-200 to-indigo-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden opacity-20'>
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
      <div className='absolute top-10 left-10 flex cursor-pointer items-center gap-2' onClick={() => navigate('/')}>
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
      <Card className='w-100 border-white/10 bg-white/50 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-500/20 dark:bg-white/5'>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username' className='text-sm font-medium'>
                Username <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='username'
                name='username'
                placeholder='johndoe'
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                name='email'
                placeholder='johndoe@example.com'
                type='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='password'
                name='password'
                placeholder='********'
                type='password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='fullName' className='text-sm font-medium'>
                Full Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='John Doe'
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phoneNumber' className='text-sm font-medium'>
                Phone Number
              </Label>
              <Input
                id='phoneNumber'
                name='phoneNumber'
                placeholder='+1234567890'
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            {error && <p className='text-sm text-red-500'>{error}</p>}
            <Button type='submit' className='w-full'>
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-muted-foreground text-sm'>
            Already have an account?{' '}
            <Link to='/login' className='text-primary hover:underline'>
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
