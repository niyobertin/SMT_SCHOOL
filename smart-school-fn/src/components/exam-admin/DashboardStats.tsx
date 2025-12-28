
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    FileText,
    Users,
    Activity,
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        exams: {
            total: number;
            published: number;
            draft: number;
        };
        candidates: {
            total: number;
        };
        attempts: {
            total: number;
            passed: number;
            avgScore: number;
            passRate: number;
        };
        recentActivity: Array<{
            id: string;
            candidateName: string;
            examTitle: string;
            score: number;
            status: string;
            date: string;
        }>;
    };
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    if (!stats) return null;

    const examStatusData = [
        { name: 'Published', value: stats.exams.published },
        { name: 'Draft', value: stats.exams.draft },
    ];

    const passRateData = [
        { name: 'Passed', value: stats.attempts.passed },
        { name: 'Failed', value: stats.attempts.total - stats.attempts.passed },
    ];

    return (
        <div className="space-y-6 mb-8">
            {/* 1. Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Exams */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Exams</h3>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.exams.total}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-green-600 font-medium">{stats.exams.published} active</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{stats.exams.draft} drafts</span>
                    </div>
                </div>

                {/* Total Candidates */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Candidates</h3>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.candidates.total}</p>
                    <p className="text-sm text-gray-500 mt-2">Registered in organization</p>
                </div>

                {/* Total Attempts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Attempts</h3>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.attempts.total}</p>
                    <p className="text-sm text-gray-500 mt-2">Exams taken so far</p>
                </div>

                {/* Average Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Average Score</h3>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.attempts.avgScore}%</p>
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-sm font-medium ${stats.attempts.passRate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {stats.attempts.passRate}% pass rate
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exam Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6">Exam Status Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={examStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pass/Fail Ratio */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6">Pass vs Fail Ratio</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={passRateData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {passRateData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index + 1]} /> // Green for pass, Orange for fail logic needs verify
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Recent Activity List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.candidateName}</p>
                                        <p className="text-sm text-gray-500">completed <strong>{activity.examTitle}</strong></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        Score: {activity.score}%
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
