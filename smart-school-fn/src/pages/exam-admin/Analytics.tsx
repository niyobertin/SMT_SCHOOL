import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchExams,
    fetchExamAnalytics,
    setSelectedOrg,
} from '../../redux/features/examAdminSlice';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    Award,
    Target,
    FileText,
} from 'lucide-react';

const Analytics = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, exams, analytics, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    const [selectedExamId, setSelectedExamId] = useState('');

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    useEffect(() => {
        if (selectedOrg) {
            dispatch(fetchExams(selectedOrg.id));
        }
    }, [selectedOrg, dispatch]);

    useEffect(() => {
        if (selectedExamId) {
            dispatch(fetchExamAnalytics(selectedExamId));
        }
    }, [selectedExamId, dispatch]);

    const stats = analytics?.examStats || {};
    const questionStats = analytics?.questionStats || [];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Analytics</h1>
                <p className="text-gray-600">View performance statistics and insights</p>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organization
                    </label>
                    <select
                        value={selectedOrg?.id || ''}
                        onChange={(e) => {
                            const org = organizations.find((o) => o.id === e.target.value);
                            dispatch(setSelectedOrg(org));
                            setSelectedExamId('');
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Select organization...</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Exam
                    </label>
                    <select
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        disabled={!selectedOrg}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="">Select exam...</option>
                        {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                                {exam.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedExamId && analytics && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Total Attempts</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Avg Score</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.averageScore?.toFixed(1) || 0}%
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Pass Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.passRate?.toFixed(1) || 0}%
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Avg Time</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {Math.floor((stats.averageTimeSpent || 0) / 60)}m
                            </p>
                        </motion.div>
                    </div>

                    {/* Question Performance */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-bold text-gray-900">Question Performance</h2>
                        </div>

                        <div className="space-y-4">
                            {questionStats.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No question statistics available yet</p>
                                </div>
                            ) : (
                                questionStats.map((q: any, index: number) => {
                                    const accuracy = q.percentageCorrect || 0;
                                    const difficulty =
                                        accuracy >= 80
                                            ? { label: 'Easy', color: 'green' }
                                            : accuracy >= 50
                                                ? { label: 'Medium', color: 'yellow' }
                                                : { label: 'Hard', color: 'red' };

                                    return (
                                        <div key={q.questionId} className="border-2 border-gray-200 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-500">
                                                            Question {index + 1}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-medium bg-${difficulty.color}-100 text-${difficulty.color}-700`}
                                                        >
                                                            {difficulty.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900 mb-2">{q.question}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-600">
                                                        Correct: <strong>{q.correctCount || 0}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">
                                                        Incorrect: <strong>{q.incorrectCount || 0}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">
                                                        Accuracy: <strong>{accuracy.toFixed(1)}%</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${difficulty.color === 'green'
                                                            ? 'from-green-500 to-green-600'
                                                            : difficulty.color === 'yellow'
                                                                ? 'from-yellow-500 to-yellow-600'
                                                                : 'from-red-500 to-red-600'
                                                        }`}
                                                    style={{ width: `${accuracy}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}

            {!selectedExamId && (
                <div className="text-center py-20 bg-white rounded-xl">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Exam</h3>
                    <p className="text-gray-600">Choose an exam to view its analytics</p>
                </div>
            )}
        </div>
    );
};

export default Analytics;
