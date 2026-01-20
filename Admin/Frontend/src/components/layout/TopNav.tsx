import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopNavProps {
  onMenuClick?: () => void;
}

const TopNav = ({ onMenuClick }: TopNavProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-muted-foreground hover:bg-secondary/50 rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.is_super_admin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md ring-2 ring-background">
            {user?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;