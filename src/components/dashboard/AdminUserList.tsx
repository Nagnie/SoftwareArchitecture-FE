import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Users, User as UserIcon } from 'lucide-react';
import { useAuth, API_URL, type User } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminUserList() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
    }
  };

  const handleUpgradeVIP = async (userId: string, months: number) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/${userId}/upgrade-vip?months=${months}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccess(`Đã nâng cấp VIP ${months} tháng`);
        fetchAllUsers();
      } else {
        setError('Nâng cấp VIP thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  const handleDowngrade = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/${userId}/downgrade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccess('Đã hạ cấp về Regular');
        fetchAllUsers();
      } else {
        setError('Hạ cấp thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <div className="h-2 bg-linear-to-r from-red-500 via-pink-500 to-purple-500"></div>
      <CardHeader className="bg-linear-to-br from-white to-red-50">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="w-6 h-6 text-red-600" />
          Quản lý người dùng
        </CardTitle>
        <CardDescription>Tổng số: {users.length} người dùng</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {error && <Alert className="mb-4 bg-red-50 text-red-800 border-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-4 bg-green-50 text-green-800 border-green-200"><AlertDescription>{success}</AlertDescription></Alert>}

        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="p-5 bg-linear-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{u.fullName}</h3>
                      <p className="text-sm text-slate-500">@{u.username}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <span className="text-slate-500">Email:</span>
                      <p className="font-medium text-slate-800">{u.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Số ĐT:</span>
                      <p className="font-medium text-slate-800">{u.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Loại TK:</span>
                      <div className="mt-1">
                        <Badge variant={u.accountType === 'VIP' ? 'default' : 'secondary'} className={u.accountType === 'VIP' ? 'bg-linear-to-r from-amber-500 to-orange-600' : ''}>
                          {u.accountType === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                          {u.accountType}
                        </Badge>
                      </div>
                    </div>
                    {u.vipExpiryDate && (
                      <div>
                        <span className="text-slate-500">VIP đến:</span>
                        <p className="font-medium text-amber-600 mt-1">{new Date(u.vipExpiryDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {u.accountType !== 'VIP' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-1 shadow-md">
                          <Crown className="w-3 h-3" />
                          Nâng VIP
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>Nâng cấp VIP cho {u.fullName}</DialogTitle>
                          <DialogDescription>Chọn số tháng VIP</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-3 pt-4">
                          {[1, 3, 6, 12].map((months) => (
                            <Button
                              key={months}
                              disabled={loading}
                              onClick={() => handleUpgradeVIP(u.id, months)}
                              className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                            >
                              {months} tháng
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleDowngrade(u.id)}
                      className="gap-1 hover:bg-slate-100"
                    >
                      Hạ cấp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
