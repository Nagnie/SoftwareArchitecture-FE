import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserProfile() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', phoneNumber: '' });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setSuccess('Cập nhật thông tin thành công!');
        await refreshUser();
      } else {
        setError('Cập nhật thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <div className="h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="bg-linear-to-br from-white to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <User className="w-6 h-6 text-indigo-600" />
          Thông tin cá nhân
        </CardTitle>
        <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {error && <Alert className="mb-4 bg-red-50 text-red-800 border-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-4 bg-green-50 text-green-800 border-green-200"><AlertDescription>{success}</AlertDescription></Alert>}
        
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Username</Label>
              <Input value={user?.username} disabled className="bg-slate-100 border-slate-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="update-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-fullname" className="text-slate-700 font-medium">Họ tên</Label>
              <Input
                id="update-fullname"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-phone" className="text-slate-700 font-medium">Số điện thoại</Label>
              <Input
                id="update-phone"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Loại tài khoản:</span>
              <Badge variant={user?.accountType === 'VIP' ? 'default' : 'secondary'} className={`text-sm ${user?.accountType === 'VIP' ? 'bg-linear-to-r from-amber-500 to-orange-600' : ''}`}>
                {user?.accountType === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                {user?.accountType}
              </Badge>
            </div>
            {user?.vipExpiryDate && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-600">VIP hết hạn:</span>
                <span className="font-medium text-amber-600">{new Date(user.vipExpiryDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
