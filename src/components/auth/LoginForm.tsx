import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token);
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <LogIn className="w-5 h-5 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl text-white">Đăng nhập</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Truy cập vào tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/50 backdrop-blur-sm">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-username" className="text-slate-200">Username hoặc Email</Label>
            <Input
              id="login-username"
              placeholder="johndoe hoặc john@example.com"
              value={form.usernameOrEmail}
              onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-slate-200">Mật khẩu</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
