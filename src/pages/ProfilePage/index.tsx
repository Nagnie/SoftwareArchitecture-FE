import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { updateCurrentUser, changePassword, deleteAccount } from '@/services/user/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Calendar, Clock, Edit, Lock, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleUpdateProfile = async () => {
    try {
      await updateCurrentUser(editForm);
      await refreshUser();
      setIsEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      logout();
      navigate('/login');
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className='min-h-screen px-4 py-12'>
      <div className='container mx-auto max-w-5xl'>
        {/* Header Card */}
        <Card className='mb-6 border-none shadow-lg'>
          <CardContent>
            <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
              <div className='flex items-center gap-4'>
                <div className='size-20 rounded-full border bg-background bg-center shadow-sm'>
                  <Avatar className='size-19'>
                    <AvatarImage src='https://api.dicebear.com/9.x/adventurer/svg?seed=Liliana' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-neutral-900 dark:text-neutral-100'>{user.fullName}</h1>
                  <p className='mt-1 text-neutral-500 dark:text-neutral-400'>@{user.username}</p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Badge
                  variant='outline'
                  className='border-neutral-300 px-4 py-1.5 text-sm font-medium dark:border-neutral-600'
                >
                  {user.accountType}
                </Badge>
                <Badge
                  variant='outline'
                  className={`px-4 py-1.5 text-sm font-medium ${
                    user.isActive
                      ? 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400'
                      : 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-400'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <CheckCircle2 className='mr-1 inline h-3 w-3' /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className='mr-1 inline h-3 w-3' /> Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column - Contact & Account Info */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Contact Information */}
            <Card className='border-none shadow-lg'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-xl'>
                    <User className='h-5 w-5 text-neutral-600 dark:text-neutral-400' />
                    Contact Information
                  </CardTitle>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant='ghost' size='sm' className='gap-2'>
                        <Edit className='h-4 w-4' />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                      </DialogHeader>
                      <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                          <Label htmlFor='email'>Email</Label>
                          <Input
                            id='email'
                            type='email'
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='fullName'>Full Name</Label>
                          <Input
                            id='fullName'
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='phoneNumber'>Phone Number</Label>
                          <Input
                            id='phoneNumber'
                            value={editForm.phoneNumber}
                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleUpdateProfile}>Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                  <Mail className='h-5 w-5 text-neutral-500 dark:text-neutral-400' />
                  <div className='flex-1'>
                    <p className='text-xs text-neutral-500 dark:text-neutral-400'>Email</p>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>{user.email}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                  <Phone className='h-5 w-5 text-neutral-500 dark:text-neutral-400' />
                  <div className='flex-1'>
                    <p className='text-xs text-neutral-500 dark:text-neutral-400'>Phone</p>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      {user.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className='border-none shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <Shield className='h-5 w-5 text-neutral-600 dark:text-neutral-400' />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                    <p className='mb-1 text-xs text-neutral-500 dark:text-neutral-400'>Role</p>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>{user.role}</p>
                  </div>
                  <div className='rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                    <p className='mb-1 text-xs text-neutral-500 dark:text-neutral-400'>Email Verified</p>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      {user.isEmailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                {user.vipExpiryDate && (
                  <div className='rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                    <p className='mb-1 text-xs text-neutral-500 dark:text-neutral-400'>VIP Membership</p>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      Expires on {formatDate(user.vipExpiryDate)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Security */}
          <div className='space-y-6'>
            {/* Activity */}
            <Card className='border-none shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <Calendar className='h-5 w-5 text-neutral-600 dark:text-neutral-400' />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
                    <p className='text-xs text-neutral-500 dark:text-neutral-400'>Member Since</p>
                  </div>
                  <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className='rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
                    <p className='text-xs text-neutral-500 dark:text-neutral-400'>Last Login</p>
                  </div>
                  <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                    {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className='border-none shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <Lock className='h-5 w-5 text-neutral-600 dark:text-neutral-400' />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full justify-start gap-2'>
                      <Lock className='h-4 w-4' />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='currentPassword'>Current Password</Label>
                        <Input
                          id='currentPassword'
                          type='password'
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='newPassword'>New Password</Label>
                        <Input
                          id='newPassword'
                          type='password'
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                        <Input
                          id='confirmPassword'
                          type='password'
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleChangePassword}>Change Password</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20'
                    >
                      <Trash2 className='h-4 w-4' />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className='bg-red-600 hover:bg-red-700'>
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
