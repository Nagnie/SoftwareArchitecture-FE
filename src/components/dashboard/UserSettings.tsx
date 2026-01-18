import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Trash2 } from 'lucide-react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserSettings() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordForm)
      });
      if (response.ok) {
        setSuccess('Đổi mật khẩu thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        setError('Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    // Note: The Dialog handles the first confirmation, this is the action
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        logout();
      } else {
        setError('Xóa tài khoản thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className="h-2 bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
        <CardHeader className="bg-linear-to-br from-white to-blue-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lock className="w-6 h-6 text-blue-600" />
            Đổi mật khẩu
          </CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {error && <Alert className="mb-4 bg-red-50 text-red-800 border-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 bg-green-50 text-green-800 border-green-200"><AlertDescription>{success}</AlertDescription></Alert>}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-700 font-medium">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-700 font-medium">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-0 border-l-4 border-red-500 overflow-hidden">
        <CardHeader className="bg-linear-to-br from-white to-red-50">
          <CardTitle className="flex items-center gap-2 text-2xl text-red-600">
            <Trash2 className="w-6 h-6" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription className="text-red-600">Hành động này không thể hoàn tác</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tài khoản vĩnh viễn
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-red-600">Xác nhận xóa tài khoản</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="flex-1"
                >
                  Xác nhận xóa
                </Button>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">Hủy</Button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
