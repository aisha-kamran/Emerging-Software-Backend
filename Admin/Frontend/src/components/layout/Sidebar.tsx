import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Shield, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/blogs', label: 'Blog Management', icon: FileText },
    { path: '/admins', label: 'Admin Management', icon: Users, superAdminOnly: true },
    // { path: '/logs', label: 'Activity Logs', icon: ClipboardList },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Filter menu items based on Role
  const filteredItems = navItems.filter(item => !item.superAdminOnly || isSuperAdmin);

  const sidebarClasses = `
    fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <span>AdminPanel</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              {/* Initials Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {/* 👇 FIXED: 'name' ko 'username' kar diya */}
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.username || 'User'}
                </p>
                {/* 👇 FIXED: Role logic check */}
                <p className="truncate text-xs text-muted-foreground">
                  {user?.is_super_admin ? 'Super Admin' : 'Admin'}
                </p>
              </div>

              <button
                onClick={logout}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;