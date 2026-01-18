import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, User } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { UserSettings } from '@/components/dashboard/UserSettings';
import { AdminUserList } from '@/components/dashboard/AdminUserList';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-xl">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <User className="w-4 h-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <Settings className="w-4 h-4" />
              Cài đặt
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg">
                <Users className="w-4 h-4" />
                Quản lý Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <UserSettings />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminUserList />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
