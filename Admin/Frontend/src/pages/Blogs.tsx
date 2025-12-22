import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import { Blog, getBlogs, addBlog, updateBlog, deleteBlog, addLog } from '@/lib/storage';

const Blogs = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [blogs, setBlogs] = useState<Blog[]>(getBlogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedBlog(null);
    setTitle('');
    setContent('');
    setStatus('draft');
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setStatus(blog.status);
    setIsModalOpen(true);
  };

  const openDeleteModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (selectedBlog) {
      // Update
      const updated = updateBlog(selectedBlog.id, { title, content, status });
      if (updated) {
        setBlogs(getBlogs());
        addLog({
          adminId: user!.id,
          adminName: user!.name,
          action: 'update',
          entity: 'blog',
          entityName: title,
        });
        showToast('success', 'Blog updated successfully');
      }
    } else {
      // Create
      addBlog({
        title,
        content,
        status,
        author: user!.name,
        authorId: user!.id,
      });
      setBlogs(getBlogs());
      addLog({
        adminId: user!.id,
        adminName: user!.name,
        action: 'create',
        entity: 'blog',
        entityName: title,
      });
      showToast('success', 'Blog created successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedBlog) {
      deleteBlog(selectedBlog.id);
      setBlogs(getBlogs());
      addLog({
        adminId: user!.id,
        adminName: user!.name,
        action: 'delete',
        entity: 'blog',
        entityName: selectedBlog.title,
      });
      showToast('success', 'Blog deleted successfully');
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
    <AdminLayout title="Blog Management" subtitle="Create, edit, and manage blog posts">
      {/* Header Actions */}
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

      {/* Blog Table */}
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
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    No blogs found
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">{blog.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {blog.content}
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{blog.author}</td>
                    <td>
                      <span className={`badge ${blog.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{formatDate(blog.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="btn btn-ghost p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(blog)}
                          className="btn btn-ghost p-2 text-destructive hover:bg-destructive/10"
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
        title={selectedBlog ? 'Edit Blog' : 'Create Blog'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter blog title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field min-h-[150px] resize-y"
              placeholder="Write your blog content..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              className="input-field"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
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
              {selectedBlog ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog"
        message={`Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default Blogs;
