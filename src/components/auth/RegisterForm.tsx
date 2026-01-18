import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    username: '', email: '', password: '', fullName: '', phoneNumber: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setForm({ username: '', email: '', password: '', fullName: '', phoneNumber: '' });
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <UserPlus className="w-5 h-5 text-purple-400" />
          </div>
          <CardTitle className="text-2xl text-white">Đăng ký</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Tạo tài khoản mới miễn phí</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/50 backdrop-blur-sm">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
        )}
        {success && (
            <Alert className="mb-4 bg-green-500/10 border-green-500/50 backdrop-blur-sm">
                <AlertDescription className="text-green-200">{success}</AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-slate-200 text-sm">Username</Label>
            <Input
              id="reg-username"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 h-9"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-slate-200 text-sm">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 h-9"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-slate-200 text-sm">Mật khẩu</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 h-9"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-fullname" className="text-slate-200 text-sm">Họ tên</Label>
            <Input
              id="reg-fullname"
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 h-9"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-phone" className="text-slate-200 text-sm">Số điện thoại</Label>
            <Input
              id="reg-phone"
              placeholder="0123456789"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 h-9"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
