import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Shield, ShieldCheck, Mail, User } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  created_at: string;
}

const Admins = () => {
  const { user, isSuperAdmin } = useAuth();
  const { showToast } = useToastNotification();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

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

  const openCreateModal = () => {
    setSelectedAdmin(null);
    setEmail('');
    setFullName('');
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEmail(admin.email);
    setFullName(admin.full_name || '');
    setPassword('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      showToast('error', 'Name and Email are required');
      return;
    }

    try {
      if (selectedAdmin) {
        const updateData: any = { email, full_name: fullName };
        if (password) updateData.password = password;
        
        await api.updateAdmin(selectedAdmin.id, updateData);
        showToast('success', 'Admin updated successfully');
      } else {
        if (!password) {
          showToast('error', 'Password is required for new admins');
          return;
        }
        await api.createAdmin(email, fullName, password);
        showToast('success', 'Admin created & email sent!');
      }
      setIsModalOpen(false);
      loadAdmins();
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

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
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Admin Management" subtitle="Manage team members">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
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
                <th>Admin</th>
                <th>Role</th>
                <th>Joined</th>
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
                            {admin.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{admin.full_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {admin.email}
                            </p>
                        </div>
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
                        {isSuperAdmin && (
                            <button onClick={() => openEditModal(admin)} className="btn btn-ghost p-2">
                            <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {isSuperAdmin && admin.id !== 1 && admin.id !== user?.id && (
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
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter full name"
                />
            </div>
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
                placeholder="admin@company.com"
                />
            </div>
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
              placeholder={selectedAdmin ? "Leave blank to keep" : "Enter password"}
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
        message={`Delete "${selectedAdmin?.full_name}"?`}
        confirmLabel="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default Admins;