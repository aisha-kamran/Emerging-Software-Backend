import { useState, useMemo } from 'react';
import { Filter, User, Activity } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getLogs, getUsers, ActivityLog } from '@/lib/storage';

const Logs = () => {
  const logs = getLogs();
  const users = getUsers();
  
  const [dateFilter, setDateFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        // Date filter
        if (dateFilter) {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          if (logDate !== dateFilter) return false;
        }
        
        // Admin filter
        if (adminFilter && log.adminId !== adminFilter) return false;
        
        // Action filter
        if (actionFilter && log.action !== actionFilter) return false;
        
        return true;
      })
      .reverse(); // Most recent first
  }, [logs, dateFilter, adminFilter, actionFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'create': return 'badge-success';
      case 'update': return 'badge-primary';
      case 'delete': return 'badge-error';
      default: return '';
    }
  };

  const clearFilters = () => {
    setDateFilter('');
    setAdminFilter('');
    setActionFilter('');
  };

  const hasFilters = dateFilter || adminFilter || actionFilter;

  return (
    <AdminLayout title="Activity Logs" subtitle="Track all CRUD operations in the system">
      {/* Filters */}
      <div className="stat-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Filters</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        
      </div>

      {/* Logs Table */}
      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-muted-foreground whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {log.adminName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-foreground">{log.adminName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted-foreground capitalize">{log.entity}</span>
                    </td>
                    <td>
                      <span className="text-foreground">{log.entityName}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <div className="stat-card text-center">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-accent">
              {logs.filter(l => l.action === 'create').length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Creates</p>
        </div>
        <div className="stat-card text-center">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-primary">
              {logs.filter(l => l.action === 'update').length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Updates</p>
        </div>
        <div className="stat-card text-center">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-destructive">
              {logs.filter(l => l.action === 'delete').length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Deletes</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Logs;
