import { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react'; // Palette hata diya
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotification } from '@/components/ui/ToastNotification';
import api from '@/lib/api';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      showToast('error', 'Name and Email cannot be empty');
      return;
    }

    try {
        const payload: any = { email, full_name: fullName };
        if (password.trim()) {
            payload.password = password;
        }

        if (user?.id) {
            await api.updateAdmin(user.id, payload);
            showToast('success', 'Profile updated successfully. Please re-login.');
            setPassword('');
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
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                />
              </div>
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

      </div>
    </AdminLayout>
  );
};

export default Settings;