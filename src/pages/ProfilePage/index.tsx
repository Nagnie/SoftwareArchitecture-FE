import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='container mx-auto max-w-3xl py-10'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>{user.fullName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
            <div className='flex gap-2'>
              <Badge variant={user.accountType === 'VIP' ? 'default' : 'secondary'}>{user.accountType}</Badge>
              <Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Contact Information</h3>
            <div className='grid gap-3'>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Email:</span>
                <span className='col-span-2 font-medium'>{user.email}</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Phone:</span>
                <span className='col-span-2 font-medium'>{user.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Account Details</h3>
            <div className='grid gap-3'>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Role:</span>
                <span className='col-span-2 font-medium'>{user.role}</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Email Verified:</span>
                <span className='col-span-2 font-medium'>{user.isEmailVerified ? 'Yes' : 'No'}</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>VIP Status:</span>
                <span className='col-span-2 font-medium'>
                  {user.vipExpiryDate ? `Expires on ${formatDate(user.vipExpiryDate)}` : 'Not a VIP member'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Activity</h3>
            <div className='grid gap-3'>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Member Since:</span>
                <span className='col-span-2 font-medium'>{formatDate(user.createdAt)}</span>
              </div>
              <div className='grid grid-cols-3'>
                <span className='text-muted-foreground'>Last Login:</span>
                <span className='col-span-2 font-medium'>{formatDate(user.lastLoginAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
