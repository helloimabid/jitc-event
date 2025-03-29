import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Shield, Bell, Globe, Moon, Sun, Laptop, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { updateAdminPassword, getCurrentAdmin, loginAdmin } from '@/services/authService';
import AdminManagement from './AdminManagement';

const SettingsPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const currentAdmin = getCurrentAdmin();
  
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');
  
  const handlePasswordChange = async (data: any) => {
    if (!currentAdmin) return;
    
    // Ensure the admin can only change their own password
    setIsLoading(true);
    try {
      // Verify the current password matches before allowing the change
      const loginSuccess = await loginAdmin(currentAdmin.username, data.currentPassword);
      
      if (!loginSuccess) {
        toast.error('Current password is incorrect');
        setIsLoading(false);
        return;
      }
      
      const success = await updateAdminPassword(currentAdmin.id, data.newPassword);
      
      if (success) {
        toast.success('Password updated successfully');
        reset();
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    localStorage.setItem('theme', newTheme);
    toast.success(`Theme set to ${newTheme}`);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account settings and change your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={currentAdmin?.username || ''} disabled />
                <p className="text-sm text-gray-500">
                  Your username cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handlePasswordChange)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
                      type={showPassword ? "text" : "password"}
                      {...register('currentPassword', { 
                        required: 'Current password is required'
                      })}
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500">{errors.currentPassword.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showNewPassword ? "text" : "password"}
                      {...register('newPassword', { 
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your new password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the admin interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center ${
                    theme === 'light' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center ${
                    theme === 'dark' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center ${
                    theme === 'system' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('system')}
                >
                  <Laptop className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins">
          <AdminManagement />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for new registrations
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive browser notifications when logged in
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Payment Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about new payments and payment issues
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
