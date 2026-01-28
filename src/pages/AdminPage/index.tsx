import { useEffect, useState } from 'react';
import { getAllUsers, upgradeToVip, downgradeUser } from '@/services/user/api';
import { adminVipRequestApi } from '@/services/admin/api';
import type { User } from '@/services/user/type';
import type { VipRequest } from '@/services/admin/type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [vipRequests, setVipRequests] = useState<VipRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [vipMonths, setVipMonths] = useState(1);

  useEffect(() => {
    fetchUsers();
    fetchVipRequests();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchVipRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await adminVipRequestApi.getAllRequests();
      setVipRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch VIP requests', error);
      // toast.error('Failed to fetch VIP requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleUpgradeVip = async (userId: number) => {
    try {
      await upgradeToVip(userId, vipMonths);
      toast.success('User upgraded to VIP');
      fetchUsers();
    } catch (error) {
      console.error('Failed to upgrade user', error);
      toast.error('Failed to upgrade user');
    }
  };

  const handleDowngrade = async (userId: number) => {
    try {
      await downgradeUser(userId);
      toast.success('User downgraded');
      fetchUsers();
    } catch (error) {
      console.error('Failed to downgrade user', error);
      toast.error('Failed to downgrade user');
    }
  };

  const handleProcessRequest = async (requestId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminVipRequestApi.processRequest(requestId, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchVipRequests();
      // Also refresh users to reflect changes if approved
      if (status === 'APPROVED') {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to process request', error);
      toast.error('Failed to process request');
    }
  };

  const getStatusBadge = (status: any) => {
    // Handle potential object or string status
    const statusStr = typeof status === 'object' ? 'UNKNOWN' : status;

    switch (statusStr) {
      case 'APPROVED':
        return <Badge className='bg-green-500'>Approved</Badge>;
      case 'REJECTED':
        return <Badge variant='destructive'>Rejected</Badge>;
      case 'PENDING':
        return <Badge variant='secondary'>Pending</Badge>;
      default:
        return <Badge variant='outline'>{statusStr}</Badge>;
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Admin Dashboard</h1>

      <Tabs defaultValue='users' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='users'>User Management</TabsTrigger>
          <TabsTrigger value='requests'>VIP Requests</TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
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
                {loadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={8} className='py-4 text-center'>
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='py-4 text-center'>
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.vipExpiryDate
                          ? `VIP until ${new Date(user.vipExpiryDate).toLocaleDateString()}`
                          : 'Regular'}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value='requests'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Months</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRequests ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-4 text-center'>
                      Loading requests...
                    </TableCell>
                  </TableRow>
                ) : vipRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-4 text-center'>
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  vipRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.id}</TableCell>
                      <TableCell>{req.userId}</TableCell>
                      <TableCell className='max-w-50 truncate' title={req.message}>
                        {req.message || '-'}
                      </TableCell>
                      <TableCell>{req.requestedMonths}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {String(req.status) === 'PENDING' && (
                          <div className='flex space-x-2'>
                            <Button
                              size='sm'
                              className='bg-green-600 hover:bg-green-700'
                              onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
