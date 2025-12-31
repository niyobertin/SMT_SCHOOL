
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
    Building2,
    HelpCircle,
    FileText,
    Users,
    Activity,
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        organizations?: { total: number };
        questions?: { total: number };
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
        examDurationStats?: Array<{
            examTitle: string;
            avgTimeMinutes: number;
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Global Stats - Only shown if available */}
                {stats.organizations && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Organizations</h3>
                            <div className="p-1.5 bg-orange-50 rounded-lg">
                                <Building2 className="w-4 h-4 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{stats.organizations.total}</p>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">Active Orgs</p>
                    </div>
                )}

                {/* Total Questions */}
                {stats.questions && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Question Bank</h3>
                            <div className="p-1.5 bg-teal-50 rounded-lg">
                                <HelpCircle className="w-4 h-4 text-teal-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{stats.questions.total}</p>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">Total Items</p>
                    </div>
                )}

                {/* Total Exams */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Total Exams</h3>
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-tight">{stats.exams.total}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <span className="text-green-600 font-bold">{stats.exams.published} active</span>
                    </div>
                </div>

                {/* Total Candidates */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Candidates</h3>
                        <div className="p-1.5 bg-purple-50 rounded-lg">
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-tight">{stats.candidates.total}</p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">Registered</p>
                </div>

                {/* Total Attempts */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Attempts</h3>
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-tight">{stats.attempts.total}</p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">Total Taken</p>
                </div>

                {/* Average Score */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Avg Score</h3>
                        <div className="p-1.5 bg-green-50 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-tight">{stats.attempts.avgScore}%</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[10px] font-bold ${stats.attempts.passRate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {stats.attempts.passRate}% pass
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exam Duration Stats */}
                {stats.examDurationStats && stats.examDurationStats.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
                        <h3 className="font-bold text-gray-900 mb-6">Avg Time Spent per Exam (Minutes)</h3>
                        <div className="h-48 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.examDurationStats} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="examTitle" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="avgTimeMinutes" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} name="Minutes" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

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

        </div>
    );
};

export default DashboardStats;
