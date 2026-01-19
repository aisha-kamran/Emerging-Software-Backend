import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Shield, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface AdminUser {
  id: number;
  username: string;
  is_super_admin: boolean;
  created_at: string;
}

const Admins = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 1. Fetch Admins from API
  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await api.fetchAdmins();
      setAdmins(data);
    } catch (error) {
      showToast('error', 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // 2. Open Create Modal
  const openCreateModal = () => {
    setSelectedAdmin(null);
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };

  // 3. Open Edit Modal
  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setUsername(admin.username);
    setPassword(''); // Passwords usually reset on edit
    setIsModalOpen(true);
  };

  // 4. Open Delete Modal
  const openDeleteModal = (admin: AdminUser) => {
    if (admin.id === 1 || admin.is_super_admin) {
      // Note: Logic allows super admin deletion only if current user is also super admin, handled by backend
    }
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // 5. Handle Submit (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('error', 'Username is required');
      return;
    }

    try {
      if (selectedAdmin) {
        // Update
        const updateData: any = { username };
        if (password) updateData.password = password;
        
        await api.updateAdmin(selectedAdmin.id, updateData);
        showToast('success', 'Admin updated successfully');
      } else {
        // Create
        if (!password) {
          showToast('error', 'Password is required for new admins');
          return;
        }
        await api.createAdmin(username, password);
        showToast('success', 'Admin created successfully');
      }
      setIsModalOpen(false);
      loadAdmins(); // Refresh list
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  // 6. Handle Delete
  const handleDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await api.deleteAdmin(selectedAdmin.id);
      showToast('success', 'Admin deleted successfully');
      setIsDeleteModalOpen(false);
      loadAdmins();
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout 
      title="Admin Management" 
      subtitle="Manage team members and their permissions"
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search admins..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8">No admins found</td></tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {admin.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{admin.username}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {admin.is_super_admin ? (
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`badge ${admin.is_super_admin ? 'badge-primary' : 'badge-success'}`}>
                          {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(admin)} className="btn btn-ghost p-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Cannot delete permanent admin (ID 1) or self */}
                        {admin.id !== 1 && (
                            <button
                            onClick={() => openDeleteModal(admin)}
                            className="btn btn-ghost p-2 text-destructive hover:bg-destructive/10"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdmin ? 'Edit Admin' : 'Add Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
                {selectedAdmin ? 'New Password (Optional)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={selectedAdmin ? "Leave blank to keep current" : "Enter password"}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{selectedAdmin ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${selectedAdmin?.username}"?`}
        confirmLabel="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default Admins;