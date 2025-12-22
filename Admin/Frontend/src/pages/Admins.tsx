import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Shield, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import { User, getUsers, addUser, updateUser, deleteUser, addLog } from '@/lib/storage';

const Admins = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [admins, setAdmins] = useState<User[]>(getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedAdmin(null);
    setName('');
    setEmail('');
    setRole('admin');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: User) => {
    setSelectedAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setRole(admin.role);
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin: User) => {
    if (admin.role === 'superadmin') {
      showToast('error', 'Cannot delete Super Admin');
      return;
    }
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    // Check for duplicate email
    const existingAdmin = admins.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && 
      a.id !== selectedAdmin?.id
    );
    if (existingAdmin) {
      showToast('error', 'Email already exists');
      return;
    }

    if (selectedAdmin) {
      // Cannot change super admin role
      const updates: Partial<User> = { name, email };
      if (selectedAdmin.role !== 'superadmin') {
        updates.role = role;
      }
      
      updateUser(selectedAdmin.id, updates);
      setAdmins(getUsers());
      addLog({
        adminId: user!.id,
        adminName: user!.name,
        action: 'update',
        entity: 'admin',
        entityName: name,
      });
      showToast('success', 'Admin updated successfully');
    } else {
      addUser({ name, email, role });
      setAdmins(getUsers());
      addLog({
        adminId: user!.id,
        adminName: user!.name,
        action: 'create',
        entity: 'admin',
        entityName: name,
      });
      showToast('success', 'Admin created successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedAdmin) {
      const success = deleteUser(selectedAdmin.id);
      if (success) {
        setAdmins(getUsers());
        addLog({
          adminId: user!.id,
          adminName: user!.name,
          action: 'delete',
          entity: 'admin',
          entityName: selectedAdmin.name,
        });
        showToast('success', 'Admin deleted successfully');
      } else {
        showToast('error', 'Cannot delete this admin');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout 
      title="Admin Management" 
      subtitle="Manage team members and their permissions"
      requireSuperAdmin
    >
      {/* Header Actions */}
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

      {/* Admin Table */}
      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    No admins found
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {admin.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{admin.name}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{admin.email}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {admin.role === 'superadmin' ? (
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`badge ${admin.role === 'superadmin' ? 'badge-primary' : 'badge-success'}`}>
                          {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{formatDate(admin.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="btn btn-ghost p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          disabled={admin.role === 'superadmin'}
                          className="btn btn-ghost p-2 text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdmin ? 'Edit Admin' : 'Add Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter admin name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}
              className="input-field"
              disabled={selectedAdmin?.role === 'superadmin'}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            {selectedAdmin?.role === 'superadmin' && (
              <p className="text-xs text-muted-foreground mt-1">
                Super Admin role cannot be changed
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {selectedAdmin ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${selectedAdmin?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default Admins;
