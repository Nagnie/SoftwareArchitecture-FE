import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Crown, LogOut, Shield, User } from 'lucide-react';

export function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Xin chào, {user?.fullName || user?.username}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user?.accountType === 'VIP' ? 'default' : 'secondary'} className={user?.accountType === 'VIP' ? 'bg-linear-to-r from-amber-500 to-orange-600' : ''}>
              {user?.accountType === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
              {user?.accountType || 'REGULAR'}
            </Badge>
            {isAdmin && (
              <Badge className="bg-linear-to-r from-red-500 to-pink-600">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
            )}
          </div>
        </div>
      </div>
      <Button
        onClick={logout}
        variant="outline"
        className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </Button>
    </div>
  );
}
