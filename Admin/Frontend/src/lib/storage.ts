// Storage utilities for localStorage persistence

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  isRemote?: boolean;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  status: 'published' | 'draft';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  adminId: string;
  adminName: string;
  action: 'create' | 'update' | 'delete';
  entity: 'blog' | 'admin';
  entityName: string;
}

// Initialize default data
export const initializeStorage = () => {
  // Check if already initialized
  if (localStorage.getItem('initialized')) return;

  // Default Super Admin (cannot be deleted)
  const superAdmin: User = {
    id: 'superadmin-001',
    email: 'superadmin@admin.com',
    name: 'Super Admin',
    role: 'superadmin',
    createdAt: new Date().toISOString(),
  };

  // Default Admin
  const defaultAdmin: User = {
    id: 'admin-001',
    email: 'admin@admin.com',
    name: 'John Doe',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  // Sample blogs
  const sampleBlogs: Blog[] = [
    {
      id: 'blog-001',
      title: 'Getting Started with Admin Panel',
      content: 'Welcome to the admin panel! This guide will help you get started with managing your blog content effectively.',
      author: 'Super Admin',
      authorId: 'superadmin-001',
      status: 'published',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'blog-002',
      title: 'Best Practices for Content Management',
      content: 'Learn the best practices for managing your content efficiently using our powerful admin tools.',
      author: 'John Doe',
      authorId: 'admin-001',
      status: 'published',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'blog-003',
      title: 'Upcoming Features Preview',
      content: 'Take a sneak peek at the exciting new features we are working on for the next release.',
      author: 'Super Admin',
      authorId: 'superadmin-001',
      status: 'draft',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Sample activity logs
  const sampleLogs: ActivityLog[] = [
    {
      id: 'log-001',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      adminId: 'superadmin-001',
      adminName: 'Super Admin',
      action: 'create',
      entity: 'blog',
      entityName: 'Getting Started with Admin Panel',
    },
    {
      id: 'log-002',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      adminId: 'admin-001',
      adminName: 'John Doe',
      action: 'create',
      entity: 'blog',
      entityName: 'Best Practices for Content Management',
    },
    {
      id: 'log-003',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      adminId: 'superadmin-001',
      adminName: 'Super Admin',
      action: 'create',
      entity: 'blog',
      entityName: 'Upcoming Features Preview',
    },
  ];

  localStorage.setItem('users', JSON.stringify([superAdmin, defaultAdmin]));
  localStorage.setItem('blogs', JSON.stringify(sampleBlogs));
  localStorage.setItem('activityLogs', JSON.stringify(sampleLogs));
  localStorage.setItem('initialized', 'true');
};

// User functions
export const getUsers = (): User[] => {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : [];
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  localStorage.setItem('users', JSON.stringify(users));
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  
  // Cannot delete super admin
  if (user?.role === 'superadmin') return false;
  
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
  return true;
};

// Blog functions
export const getBlogs = (): Blog[] => {
  const data = localStorage.getItem('blogs');
  return data ? JSON.parse(data) : [];
};

export const addBlog = (blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Blog => {
  const blogs = getBlogs();
  const newBlog: Blog = {
    ...blog,
    id: `blog-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  blogs.push(newBlog);
  localStorage.setItem('blogs', JSON.stringify(blogs));
  return newBlog;
};

export const updateBlog = (id: string, updates: Partial<Blog>): Blog | null => {
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  blogs[index] = { ...blogs[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem('blogs', JSON.stringify(blogs));
  return blogs[index];
};

export const deleteBlog = (id: string): boolean => {
  const blogs = getBlogs();
  const filtered = blogs.filter(b => b.id !== id);
  localStorage.setItem('blogs', JSON.stringify(filtered));
  return true;
};

// Activity Log functions
export const getLogs = (): ActivityLog[] => {
  const data = localStorage.getItem('activityLogs');
  return data ? JSON.parse(data) : [];
};

export const addLog = (log: Omit<ActivityLog, 'id' | 'date'>): ActivityLog => {
  const logs = getLogs();
  const newLog: ActivityLog = {
    ...log,
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
  };
  logs.push(newLog);
  localStorage.setItem('activityLogs', JSON.stringify(logs));
  return newLog;
};

// Auth functions
export const getCurrentUser = (): User | null => {
  const data = sessionStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
};

export const login = (email: string, password: string): User | null => {
  // Demo authentication - any password works
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  sessionStorage.removeItem('currentUser');
};
