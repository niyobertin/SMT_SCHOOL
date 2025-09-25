import { useEffect, useState } from 'react';
import { Users, BookOpen, CreditCard, DollarSign, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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
  Legend
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
      <div className="space-y-6 p-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <Skeleton height={20} width={100} className="mb-4" /> {/* title */}
              <Skeleton height={30} width={80} /> {/* value */}
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-80">
          <Skeleton height="100%" />
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <Skeleton circle height={40} width={40} />
              <div className="ml-4 space-y-2 flex-1">
                <Skeleton height={15} width="50%" />
                <Skeleton height={12} width="80%" />
                <Skeleton height={10} width="30%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (error || !stats) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedRevenue = [...stats.revenueTrend].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const labels = sortedRevenue.map(item => new Date(item.createdAt).toLocaleDateString());

  const completedData = sortedRevenue
    .map(item => (item.status === "COMPLETED" ? item.amount : 0));

  const failedData = sortedRevenue
    .map(item => (item.status === "FAILED" ? item.amount : 0));


  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completed Revenue (RWF)',
        data: completedData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Failed Payments (RWF)',
        data: failedData,
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        tension: 0.1,
      },
    ],
  };


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Trend (Last 7 days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number) => {
            if (typeof tickValue === 'number') {
              return `RWF ${tickValue.toLocaleString()}`;
            }
            return tickValue;
          },
        },
      },
    },
  };


  const totalRevenue = stats.revenueTrend
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Courses"
          value={stats.courses}
          icon={BookOpen}
          color="bg-purple-500"
        />
        <StatsCard
          title="Active Enrollments"
          value={stats.enrollments}
          icon={CreditCard}
          color="bg-green-500"
        />
        <StatsCard
          title="Total Revenue"
          value={`RWF ${totalRevenue.toLocaleString()
            }`}
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          <Activity className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {stats.logs.map((log) => (
            <div key={log.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {log.userId ? log.userId.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                <p className="text-sm text-gray-500">{log.details}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};