import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// Interface Update
interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  status: string;
  created_at: string; // Backend sends snake_case
}

const Blogs = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Loading state

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');

  // 1. Fetch Blogs (Updated Logic)
  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.fetchBlogs();
      // Data ko set karne se pehle check karein
      if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Blogs Fetch Error:", error);
      showToast('error', 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // ... (Baaki handlers same rahenge: OpenModal, HandleSubmit etc.) ...
  const openCreateModal = () => {
    setSelectedBlog(null);
    setTitle('');
    setContent('');
    setStatus('draft');
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setStatus(blog.status);
    setIsModalOpen(true);
  };

  const openDeleteModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title,
      content,
      status,
      author: user?.email || user?.full_name || 'Admin'
    };

    try {
      if (selectedBlog) {
        await api.updateBlog(selectedBlog.id, payload);
        showToast('success', 'Blog updated');
      } else {
        await api.createBlog(payload);
        showToast('success', 'Blog created');
      }
      setIsModalOpen(false);
      loadBlogs();
    } catch (error) {
      showToast('error', 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      await api.deleteBlog(selectedBlog.id);
      showToast('success', 'Deleted');
      setIsDeleteModalOpen(false);
      loadBlogs();
    } catch (error) {
      showToast('error', 'Delete failed');
    }
  };

  // Safe Date Formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Blog Management" subtitle="Create, edit, and manage blog posts">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blogs..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Create Blog
        </button>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={5} className="text-center py-8">Loading data from server...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No blogs found</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div>
                        {/* Safe Access using ?. */}
                        <p className="font-medium text-foreground">{blog?.title || 'No Title'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {blog?.content?.substring(0, 50)}...
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{blog?.author || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${blog?.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {blog?.status || 'draft'}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                        {/* Backend sends created_at (snake_case) */}
                        {formatDate(blog?.created_at)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(blog)} className="btn btn-ghost p-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDeleteModal(blog)} className="btn btn-ghost p-2 text-destructive hover:bg-destructive/10">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBlog ? 'Edit Blog' : 'Create Blog'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Enter title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field min-h-[150px]" placeholder="Content..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{selectedBlog ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog"
        message="Are you sure?"
        confirmLabel="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default Blogs;