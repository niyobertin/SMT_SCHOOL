import { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, Activity, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    user: {
      username: string;
      role: string;
    };
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, coursesResponse] = await Promise.all([
          api.get('/users/dashboard/stats'),
          api.get('/courses')
        ]);

        if (statsResponse.data.status === 'success') {
          setStats(statsResponse.data.data);
        }

        if (coursesResponse.data.status === 'success') {
          setCourses(coursesResponse.data.data.courses.slice(0, 6)); // Show first 6 courses
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
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

        {/* Recent Courses List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Courses</h2>
              <p className="text-slate-500 text-sm font-medium">Manage and monitor academic offerings</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-[#1a7ea5] hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              View All Courses
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50 border border-slate-100 p-6 rounded-2xl group hover:border-[#1a7ea5]/30 hover:bg-white hover:shadow-xl hover:shadow-[#1a7ea5]/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#1a7ea5]/5 transition-colors">
                      <BookOpen size={20} className="text-[#1a7ea5]" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {course.lessons?.length || 0} Lessons
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors leading-tight mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/50">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <Users size={12} className="text-slate-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {course.category?.name || "Academic"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 bg-slate-50/50 p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BookOpen size={24} className="text-[#1a7ea5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Explore and Manage Courses</h3>
                <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm mx-auto">
                  Navigate to the courses section to view, edit, and create new learning materials for your students.
                </p>
                <button
                  onClick={() => navigate('/dashboard/courses')}
                  className="px-8 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                >
                  Go to Courses Section
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};