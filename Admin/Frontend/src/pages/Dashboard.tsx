import { FileText, Users, CheckCircle, Clock, Activity } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getBlogs, getUsers, getLogs } from '@/lib/storage';

const Dashboard = () => {
  const blogs = getBlogs();
  const users = getUsers();
  const logs = getLogs();

  const publishedBlogs = blogs.filter(b => b.status === 'published').length;
  const draftBlogs = blogs.filter(b => b.status === 'draft').length;
  const recentLogs = logs.slice(-5).reverse();

  const stats = [
    { 
      label: 'Total Blogs', 
      value: blogs.length, 
      icon: FileText, 
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    },
    { 
      label: 'Published', 
      value: publishedBlogs, 
      icon: CheckCircle, 
      color: 'text-accent',
      bgColor: 'bg-accent/20'
    },
    { 
      label: 'Drafts', 
      value: draftBlogs, 
      icon: Clock, 
      color: 'text-warning',
      bgColor: 'bg-warning/20'
    },
    { 
      label: 'Total Admins', 
      value: users.length, 
      icon: Users, 
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Blogs</h2>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {blogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No blogs yet</p>
          ) : (
            <div className="space-y-4">
              {blogs.slice(-5).reverse().map((blog) => (
                <div key={blog.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{blog.title}</p>
                    <p className="text-sm text-muted-foreground">by {blog.author}</p>
                  </div>
                  <span className={`badge ${blog.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {blog.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {recentLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className={`
                    w-2 h-2 rounded-full mt-2
                    ${log.action === 'create' ? 'bg-accent' : ''}
                    ${log.action === 'update' ? 'bg-primary' : ''}
                    ${log.action === 'delete' ? 'bg-destructive' : ''}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{log.adminName}</span>
                      {' '}
                      <span className={`
                        ${log.action === 'create' ? 'text-accent' : ''}
                        ${log.action === 'update' ? 'text-primary' : ''}
                        ${log.action === 'delete' ? 'text-destructive' : ''}
                      `}>
                        {log.action}d
                      </span>
                      {' '}
                      <span className="text-muted-foreground">{log.entity}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{log.entityName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
