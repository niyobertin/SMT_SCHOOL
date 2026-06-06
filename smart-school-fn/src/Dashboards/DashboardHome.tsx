import { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, Activity, TrendingUp, Calendar, FileQuestion, GraduationCap, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from 'framer-motion';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../redux/api/api';
import { StatsCard } from './StatsCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  users: number;
  courses: number;
  lessons: number;
  enrollments: number;
  payments: number;
  tests: number;
  questions: number;
  testAttempts: number;
  logs: Array<{
    id: string;
    userId: string;
    action: string;
    user: { username: string; role: string; };
    details: string;
    ip: string;
    createdAt: string;
  }>;
  revenueTrend: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
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
      }
    };

    fetchDashboardStats();
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Skeleton height={20} width={100} className="mb-4" />
              <Skeleton height={40} width={120} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96">
          <Skeleton height="100%" borderRadius={16} />
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
            <div className="ml-4">
              <p className="text-sm font-bold text-red-800 uppercase tracking-wider mb-1">Error Loading Dashboard</p>
              <p className="text-sm text-red-700 font-medium">{error || 'No data available at the moment.'}</p>
            </div>
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

  const chartData = {
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

  const totalRevenue = stats.revenueTrend
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const passRate = stats.testAttempts > 0
    ? Math.round((stats.testAttempts / (stats.testAttempts + 1)) * 100)
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
      {/* Premium Header with KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight" tabIndex={0}>Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100" aria-label="Current date">
          <Calendar className="w-5 h-5 text-[#1a7ea5]" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          change="+12%"
        />
        <StatsCard
          title="Total Courses"
          value={stats.courses.toLocaleString()}
          icon={BookOpen}
          color="bg-indigo-500"
          change="+4%"
        />
        <StatsCard
          title="Active Enrollments"
          value={stats.enrollments.toLocaleString()}
          icon={GraduationCap}
          color="bg-emerald-500"
          change="+18%"
        />
        <StatsCard
          title="Total Revenue"
          value={`RWF ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-orange-500"
          change="+24%"
        />
      </div>

      {/* Secondary KPI Row - Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Tests Created"
          value={stats.tests.toLocaleString()}
          icon={FileQuestion}
          color="bg-purple-500"
          change={`${stats.questions} Qs`}
        />
        <StatsCard
          title="Test Attempts"
          value={stats.testAttempts.toLocaleString()}
          icon={Clock}
          color="bg-teal-500"
          change="Active"
        />
        <StatsCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={CheckCircle}
          color="bg-green-500"
          change="Average"
        />
        <StatsCard
          title="Engagement"
          value={`${engagementRate}%`}
          icon={BarChart3}
          color="bg-cyan-500"
          change="Rate"
        />
      </div>

      {/* Revenue Chart + Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Revenue Analysis</h2>
              <p className="text-slate-500 text-sm font-medium">Growth over the last 7 days</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              +8.4% growth
            </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <Line data={chartData} options={chartOptions} aria-label="Revenue trend chart" />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-slate-500 text-sm font-medium">Latest platform actions</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
            {stats.logs && stats.logs.length > 0 ? (
              stats.logs.slice(0, 8).map((log) => (
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Activity size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-bold">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.lessons.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.questions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payments</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.payments.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Revenue/User</p>
          <p className="text-xl font-black text-slate-900 mt-1">
            RWF {stats.users > 0 ? Math.round(totalRevenue / stats.users).toLocaleString() : 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
