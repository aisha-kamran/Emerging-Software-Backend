import { useState } from 'react';
import { User, Bell, Shield, Palette } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { updateUser, getUsers } from '@/lib/storage';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    activity: true,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    // Check for duplicate email
    const users = getUsers();
    const existingUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.id !== user?.id
    );
    
    if (existingUser) {
      showToast('error', 'Email already exists');
      return;
    }

    if (user) {
      updateUser(user.id, { name, email });
      showToast('success', 'Profile updated successfully');
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <input
                type="text"
                value={user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                disabled
                className="input-field opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Role cannot be changed
              </p>
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg bg-muted cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-muted cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-muted cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Activity Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about team activity</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.activity}
                onChange={(e) => setNotifications({ ...notifications, activity: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>
          </div>
        </div>

        {/* Security Info */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Your account security information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Account Status</p>
              <p className="font-medium text-accent">Active</p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Last Login</p>
              <p className="font-medium text-foreground">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Account Created</p>
              <p className="font-medium text-foreground">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Info */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Current theme settings</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-1">Theme</p>
            <p className="font-medium text-foreground">Dark Mode</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
