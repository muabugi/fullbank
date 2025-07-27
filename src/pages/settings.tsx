import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon, User as UserIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { formatDate } from '@/utils';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/api/accounts/users/me');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4 max-w-2xl mx-auto">
      <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white dark:bg-black dark:border-neutral-800">
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
            <UserIcon className="h-6 w-6" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg mb-2 bg-gray-200 dark:bg-neutral-900 flex items-center justify-center">
              <UserIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{user?.first_name || 'User'} {user?.last_name || ''}</span>
            <span className="text-gray-600 dark:text-gray-300 text-sm">{user?.email || ''}</span>
          </div>
          {/* Profile Info */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">First Name</Label>
                <Input id="first_name" placeholder="First Name" disabled value={user?.first_name || ''} className="bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-200">Last Name</Label>
                <Input id="last_name" placeholder="Last Name" disabled value={user?.last_name || ''} className="bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                <Input id="email" type="email" placeholder="Email" disabled value={user?.email || ''} className="bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
            </div>
          </div>
          {/* Registration Date */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Info</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-200">Registered on:</span>
              <span className="text-gray-900 dark:text-white font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
            </div>
          </div>
          {/* Theme Toggle */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-200">Theme:</span>
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 