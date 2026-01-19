import { useState } from 'react';
import { User, Shield, Palette, Lock } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotification } from '@/components/ui/ToastNotification';
import api from '@/lib/api';

const Settings = () => {
  const { user } = useAuth(); // Contains { id, username, is_super_admin }
  const { showToast } = useToastNotification();
  
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('error', 'Username cannot be empty');
      return;
    }

    try {
        const payload: any = { username };
        if (password.trim()) {
            payload.password = password;
        }

        if (user?.id) {
            await api.updateAdmin(user.id, payload);
            showToast('success', 'Profile updated successfully');
            setPassword(''); // Clear password field
        }
    } catch (error: any) {
        showToast('error', error.message || 'Failed to update profile');
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Manage your account">
      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your credentials</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Password (Optional)</label>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter new password to change"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <input
                type="text"
                value={user?.is_super_admin ? 'Super Admin' : 'Admin'}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </div>

            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>

        {/* Theme Info */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">System theme</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-1">Current Theme</p>
            <p className="font-medium text-foreground">Dark Mode (Default)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;