import { Link, Navigate } from 'react-router-dom';
import { Shield, ArrowRight, LayoutDashboard, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const Home = () => {
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: LayoutDashboard, title: 'Dashboard', description: 'Overview of your content and activity' },
    { icon: FileText, title: 'Blog Management', description: 'Create, edit, and manage blog posts' },
    { icon: Users, title: 'Admin Control', description: 'Manage team members and permissions' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-20">
          {/* Header */}
          <header className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">AdminPanel</span>
            </div>
            
            <Link
              to="/login"
              className="btn btn-primary"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </header>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Powerful Admin Panel for{' '}
              <span className="text-primary">Modern Teams</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Manage your blog content, team members, and track activity with our intuitive admin dashboard. Built for productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/login"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="btn btn-outline text-lg px-8 py-3"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="stat-card animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto text-center p-6 rounded-xl bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">Demo Credentials</h3>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Super Admin:</span> superadmin@admin.com
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Admin:</span> admin@admin.com
            </p>
            <p className="text-xs text-muted-foreground mt-2">(any password works)</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Admin Panel. Built with React.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
