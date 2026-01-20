const API_URL = 'http://127.0.0.1:8000';

export const api = {
  getToken: () => localStorage.getItem('token'),
  
  getHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);

    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  fetchAdmins: async () => {
    const res = await fetch(`${API_URL}/admin/list`, {
      method: 'GET',
      headers: api.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admins');
    return res.json();
  },

  createAdmin: async (email, fullName, password) => {
    const res = await fetch(`${API_URL}/admin/create`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ email, full_name: fullName, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create admin');
    }
    return res.json();
  },

  updateAdmin: async (id, data) => {
    const res = await fetch(`${API_URL}/admin/${id}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update admin');
    return res.json();
  },

  deleteAdmin: async (id) => {
    const res = await fetch(`${API_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to delete admin');
    }
    return res.json();
  },

  fetchBlogs: async (skip = 0, limit = 100) => {
    const res = await fetch(`${API_URL}/blogs?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: api.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return res.json();
  },

  fetchBlogSummary: async () => {
    const res = await fetch(`${API_URL}/blogs/summary`, {
      method: 'GET',
      headers: api.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  createBlog: async (data) => {
    const res = await fetch(`${API_URL}/blogs`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create blog');
    return res.json();
  },

  updateBlog: async (id, data) => {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update blog');
    return res.json();
  },

  deleteBlog: async (id) => {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete blog');
    return res.json();
  }
};

export default api;