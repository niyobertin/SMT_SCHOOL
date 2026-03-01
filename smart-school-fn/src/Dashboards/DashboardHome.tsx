import { useEffect } from 'react';
import { Users, BookOpen, DollarSign, Activity, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
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
import { StatsCard } from '../components/ui/StatsCard';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLmsDashboardStats } from '../redux/features/dashboardSlice';


// Register ChartJS components
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

export const DashboardHome = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchLmsDashboardStats());
  }, [dispatch]);


  if (loading) {
    return (
      <div className="space-y-6 p-8 bg-[#f8fafc] min-h-screen">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <Skeleton width={200} height={30} />
            <Skeleton width={300} height={20} />
          </div>
          <Skeleton width={150} height={40} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
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
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-6 w-6 text-red-500" />
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
      legend: {
        display: false,
      },
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
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: 'bold' as const
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
          callback: (value: any) => `RWF ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
        },
      },
    },
  };


  const totalRevenue = stats.revenueTrend
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-8"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="w-5 h-5 text-[#1a7ea5]" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Enrollments"
          value={stats.enrollments.toLocaleString()}
          icon={TrendingUp}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Analysis</h2>
              <p className="text-slate-500 text-sm font-medium">Growth over the last 7 days</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              +8.4% growth
            </div>
          </div>
          <div className="h-80 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Recent Activity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pulse</h2>
            <div className="p-2 bg-[#1a7ea5]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#1a7ea5]" />
            </div>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {stats.logs.slice(0, 8).map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.05) }}
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 relative">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#1a7ea5]/30 group-hover:bg-[#1a7ea5]/5 transition-all duration-300">
                    <span className="text-slate-900 font-bold text-sm">
                      {log.user?.username ? log.user.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  {idx === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 line-clamp-1">{log.action}</p>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{log.user?.username} • {log.user?.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-[#1a7ea5] bg-[#1a7ea5]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-100 flex items-center justify-center gap-2 group">
            View All Activity
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};