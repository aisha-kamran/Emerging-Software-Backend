import { FileText, Users, CheckCircle, Clock, Activity } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotification } from '@/components/ui/ToastNotification';

// Types define kiye taake code safe rahe
interface DashboardStats {
  total: number;
  drafts: number;
  published: number;
}

interface BlogPost {
  id: number;
  title: string;
  author: string;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useAuth(); // Current user info
  const { showToast } = useToastNotification();
  
  // State for Real Data
  const [stats, setStats] = useState<DashboardStats>({ total: 0, drafts: 0, published: 0 });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // API Call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Teeno APIs ek saath call karein
        const [summaryData, blogsData, adminsData] = await Promise.all([
          api.fetchBlogSummary(), // /blogs/summary
          api.fetchBlogs(0, 5),   // /blogs (Top 5 for recent list)
          api.fetchAdmins()       // /admin/list
        ]);

        setStats(summaryData);
        setBlogs(blogsData);
        setAdminCount(adminsData.length);
      } catch (error) {
        console.error("Dashboard Error:", error);
        showToast('error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Date Formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Cards Data Configuration
  const statCards = [
    { 
      label: 'Total Blogs', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Published', 
      value: stats.published, 
      icon: CheckCircle, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Drafts', 
      value: stats.drafts, 
      icon: Clock, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      label: 'Total Admins', 
      value: adminCount, 
      icon: Users, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      
      {/* 1. Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-[#0f172a] border border-gray-800 hover:border-gray-700 transition-all duration-200"
          >
            <div className="flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Content Grid (Recent Blogs & Activity) */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Blogs */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Blogs</h2>
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          
          {blogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No blogs created yet.</p>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="group flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-white truncate mb-1 group-hover:text-blue-400 transition-colors">
                      {blog.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by <span className="text-gray-400">{blog.author}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border
                    ${blog.status === 'published' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Activity (Simulated using Blogs Data) */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          
          {blogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-[5px] before:top-2 before:h-[85%] before:w-[2px] before:bg-gray-800">
              {blogs.map((blog) => (
                <div key={blog.id} className="flex gap-4 relative">
                  {/* Green Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 z-10 ring-4 ring-[#0f172a]" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium text-white">{blog.author}</span>
                      <span className="text-green-500 mx-1">created</span> 
                      blog
                    </p>
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {blog.title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap pt-1.5">
                    {formatDate(blog.created_at)}
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