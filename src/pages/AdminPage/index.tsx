import { useEffect, useState } from 'react';
import { getAllUsers, upgradeToVip, downgradeUser } from '@/services/user/api';
import type { User } from '@/services/user/type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [vipMonths, setVipMonths] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeVip = async (userId: number) => {
    try {
      await upgradeToVip(userId, vipMonths);
      fetchUsers();
    } catch (error) {
      console.error('Failed to upgrade user', error);
    }
  };

  const handleDowngrade = async (userId: number) => {
    try {
      await downgradeUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to downgrade user', error);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>User Management</h1>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>VIP Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.vipExpiryDate ? `VIP until ${new Date(user.vipExpiryDate).toLocaleDateString()}` : 'Regular'}
                </TableCell>
                <TableCell>
                  <div className='flex space-x-2'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant='outline' size='sm'>
                          Upgrade VIP
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-100'>
                        <DialogHeader>
                          <DialogTitle>Upgrade to VIP</DialogTitle>
                          <DialogDescription>Select duration for VIP status.</DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <label htmlFor='months' className='text-right text-sm'>
                              Months
                            </label>
                            <Input
                              id='months'
                              type='number'
                              value={vipMonths}
                              onChange={(e) => setVipMonths(parseInt(e.target.value))}
                              className='col-span-3'
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type='submit' onClick={() => handleUpgradeVip(user.id)}>
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant='destructive' size='sm' onClick={() => handleDowngrade(user.id)}>
                      Downgrade
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
