import { Shield } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AuthPage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <div className="inline-flex items-center gap-3 mb-4 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
              <Shield className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                User Portal
              </h1>
            </div>
            <p className="text-slate-300 text-lg">Quản lý tài khoản của bạn một cách dễ dàng</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <LoginForm />
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
