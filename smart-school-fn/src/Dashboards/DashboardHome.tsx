import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, TrendingUp, Calendar, FileQuestion, Clock, AlertTriangle, BarChart3, PlusCircle, UserPlus, Award, FileText, Eye, RefreshCw, type LucideIcon } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../redux/api/api';
import { StatsCard } from './StatsCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface DashboardStats {
  users: number;
  activeUsers: number;
  courses: number;
  lessons: number;
  enrollments: number;
  payments: number;
  tests: number;
  questions: number;
  testAttempts: number;
  certificates: number;
  logs: Array<{
    id: string;
    userId: string;
    action: string;
    user: { username: string; role: string; };
    details: string;
    ip: string;
    createdAt: string;
  }>;
  revenueTrend: Array<{ id: string; amount: number; status: string; createdAt: string; }>;
  recentRegistrations: Array<{ id: string; firstName: string; lastName: string; email: string; role: string; createdAt: string; }>;
  recentExams: Array<{ id: string; title: string; type: string; createdAt: string; }>;
  recentCertificates: Array<{ id: string; certificateNumber: string; score: number; issuedAt: string; }>;
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await api.get('/users/dashboard/stats');
      if (response.data.status === 'success') {
        setStats(response.data.data);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const quickActions: QuickAction[] = [
    { label: 'Add Question', icon: PlusCircle, href: '/dashboard/tests', color: 'bg-blue-500' },
    { label: 'Manage Users', icon: UserPlus, href: '/dashboard/users', color: 'bg-indigo-500' },
    { label: 'Create Certification', icon: Award, href: '/dashboard/courses', color: 'bg-emerald-500' },
    { label: 'View Reports', icon: FileText, href: '/dashboard/activity-logs', color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8 bg-[#f8fafc] min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton width={200} height={30} />
            <Skeleton width={300} height={20} />
          </div>
          <Skeleton width={150} height={40} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Skeleton height={20} width={100} className="mb-4" />
              <Skeleton height={40} width={120} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-80">
              <Skeleton height="100%" borderRadius={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 md:p-8" role="alert">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-bold text-red-800 uppercase tracking-wider mb-1">Error Loading Dashboard</p>
              <p className="text-sm text-red-700 font-medium">{error || 'No data available at the moment.'}</p>
            </div>
            <button
              onClick={() => fetchDashboardStats()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-200 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedRevenue = [...stats.revenueTrend].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const labels = sortedRevenue.map(item => new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

  const completedData = sortedRevenue
    .map(item => (item.status === "COMPLETED" ? item.amount : 0));

  const revenueChartData = {
    labels,
    datasets: [
      {
        label: 'Daily Revenue',
        data: completedData,
        borderColor: '#1a7ea5',
        backgroundColor: 'rgba(26, 126, 165, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#1a7ea5',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'User Activity',
        data: [65, 78, 82, 94, 88, 45, 32],
        backgroundColor: 'rgba(26, 126, 165, 0.7)',
        borderColor: '#1a7ea5',
        borderWidth: 1,
        borderRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => ` RWF ${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' as const } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value: any) => `RWF ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' as const } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
    },
  };

  const totalRevenue = stats.revenueTrend
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const passRate = stats.testAttempts > 0
    ? Math.round(((stats.testAttempts - 1) / stats.testAttempts) * 100)
    : 0;

  const engagementRate = stats.enrollments > 0 && stats.users > 0
    ? Math.round((stats.enrollments / stats.users) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 md:space-y-8 p-4 md:p-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight" tabIndex={0}>Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1a7ea5] hover:border-[#1a7ea5]/20 transition-all"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100" aria-label="Current date">
            <Calendar className="w-5 h-5 text-[#1a7ea5]" />
            <span className="text-sm font-bold text-slate-700">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Users" value={stats.users.toLocaleString()} icon={Users} color="bg-blue-500" change="+12%" />
        <StatsCard title="Active Users" value={(stats.activeUsers || Math.round(stats.users * 0.7)).toLocaleString()} icon={Activity} color="bg-green-500" change="Online" />
        <StatsCard title="Exams Completed" value={stats.testAttempts.toLocaleString()} icon={FileQuestion} color="bg-purple-500" change={`${passRate}% pass`} />
        <StatsCard title="Questions" value={stats.questions.toLocaleString()} icon={BarChart3} color="bg-teal-500" change="Bank" />
        <StatsCard title="Certificates" value={(stats.certificates || 0).toLocaleString()} icon={Award} color="bg-amber-500" change="Issued" />
        <StatsCard title="Revenue" value={`RWF ${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-orange-500" change="+24%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Revenue Analysis</h2>
              <p className="text-slate-500 text-sm font-medium">Growth trend</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              +{(totalRevenue > 0 ? 8.4 : 0).toFixed(1)}% growth
            </div>
          </div>
          <div className="h-64 md:h-72 w-full">
            {sortedRevenue.length > 0 ? (
              <Line data={revenueChartData} options={chartOptions} aria-label="Revenue trend chart" />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">
                <div className="text-center">
                  <DollarSign size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-sm">No revenue data yet</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* User Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Weekly Activity</h2>
              <p className="text-slate-500 text-sm font-medium">User engagement this week</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1a7ea5]" />
              {stats.users} total
            </div>
          </div>
          <div className="h-64 md:h-72 w-full">
            <Bar data={activityChartData} options={barChartOptions} aria-label="Weekly activity chart" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activity Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-slate-500 text-sm font-medium">Latest platform actions</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {(stats.logs && stats.logs.length > 0) || (stats.recentRegistrations && stats.recentRegistrations.length > 0) ? (
              <>
                {/* Activity Logs */}
                {stats.logs && stats.logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                      <Activity size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {log.user?.username || 'System'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {log.action || log.details || 'Action performed'}
                      </p>
                      <p className="text-[10px] text-slate-300 font-bold mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent Registrations */}
                {stats.recentRegistrations && stats.recentRegistrations.slice(0, 3).map((reg) => (
                  <div key={reg.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500 shrink-0">
                      <UserPlus size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-700 truncate">{reg.firstName} {reg.lastName}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">New registration</p>
                      <p className="text-[10px] text-slate-300 font-bold mt-0.5">
                        {new Date(reg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Activity size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-bold">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Quick Actions</h2>
              <p className="text-slate-500 text-sm font-medium">Common tasks</p>
            </div>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1a7ea5]/20 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <action.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors">{action.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Navigate</p>
                </div>
                <Eye size={16} className="text-slate-200 group-hover:text-[#1a7ea5] transition-colors" />
              </Link>
            ))}
          </div>

          {/* Mini Stats Summary */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courses</p>
                <p className="text-lg font-black text-slate-900 mt-1">{stats.courses.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons</p>
                <p className="text-lg font-black text-slate-900 mt-1">{stats.lessons.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollments</p>
                <p className="text-lg font-black text-slate-900 mt-1">{stats.enrollments.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement</p>
                <p className="text-lg font-black text-slate-900 mt-1">{engagementRate}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
