const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const FORCE_BACKEND = import.meta.env.VITE_FORCE_BACKEND === 'true';

type Blog = {
  id: string | number;
  title: string;
  content?: string;
  author?: string;
  authorId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

const jsonOrThrow = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const fetchBlogs = async (skip = 0, limit = 10): Promise<Blog[]> => {
  const res = await fetch(`${API_BASE}/blogs?skip=${skip}&limit=${limit}`);
  return jsonOrThrow(res);
};

export const adminLogin = async (username: string, password: string): Promise<TokenResponse> => {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  return jsonOrThrow(res);
};

export const saveToken = (token: string) => {
  sessionStorage.setItem('apiToken', token);
};

export const getToken = (): string | null => sessionStorage.getItem('apiToken');

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAdmins = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/admin/list`, {
    headers: {
      ...authHeaders(),
    },
  });
  return jsonOrThrow(res);
};

export const createBlog = async (blog: Partial<Blog>) => {
  const res = await fetch(`${API_BASE}/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(blog),
  });
  return jsonOrThrow(res);
};

export const updateBlog = async (id: string | number, updates: Partial<Blog>) => {
  const res = await fetch(`${API_BASE}/blogs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(updates),
  });
  return jsonOrThrow(res);
};

export const deleteBlog = async (id: string | number) => {
  const res = await fetch(`${API_BASE}/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  });
  return jsonOrThrow(res);
};

export const createAdmin = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE}/admin/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ username, password }),
  });
  return jsonOrThrow(res);
};

export const updateAdmin = async (id: string | number, data: { username?: string; password?: string }) => {
  const res = await fetch(`${API_BASE}/admin/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return jsonOrThrow(res);
};

export default {
  fetchBlogs,
  adminLogin,
  saveToken,
  getToken,
  fetchAdmins,
  createBlog,
  updateBlog,
  deleteBlog,
  createAdmin,
  updateAdmin,
};
