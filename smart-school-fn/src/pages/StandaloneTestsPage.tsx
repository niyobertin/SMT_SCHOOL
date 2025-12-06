import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, FileQuestion, Search, Filter as FilterIcon, Lock, GraduationCap, Unlock, Users } from 'lucide-react';
import api from '../redux/api/api';

const StandaloneTestsPage = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'STANDARD' | 'PSYCHOMETRIC' | 'INTERVIEW'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, [filterType]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tests', {
                params: {
                    standalone: filterType === 'ALL' ? undefined : (filterType === 'STANDARD' ? 'false' : undefined),
                    type: filterType === 'ALL' ? undefined : filterType,
                    limit: 100
                }
            });
            setTests(response.data.data.tests || []);
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartTest = (test: any) => {
        if (test.isLocked) {
            // If locked, redirect to course page for enrollment/subscription
            if (test.courseId) {
                navigate(`/courses/${test.courseId}/lessons`);
            } else {
                // Fallback for unknown lock
                navigate('/subscriptions');
            }
            return;
        }

        if (test.testType === 'INTERVIEW') {
            navigate(`/test/${test.id}/interview`);
        } else {
            navigate(`/test/${test.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Assessment Center</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Access all tests, exams, and assessments in one place
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search tests or courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2">
                            <FilterIcon size={20} className="text-gray-600" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">All Tests</option>
                                <option value="STANDARD">Course Exams</option>
                                <option value="PSYCHOMETRIC">Psychometric</option>
                                <option value="INTERVIEW">Interview</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Tests', value: tests.length, icon: FileQuestion, color: 'text-gray-600', bg: 'bg-gray-100' },
                        { label: 'Course Exams', value: tests.filter(t => t.testType === 'STANDARD').length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { label: 'Psychometric', value: tests.filter(t => t.testType === 'PSYCHOMETRIC').length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
                        { label: 'Interview', value: tests.filter(t => t.testType === 'INTERVIEW').length, icon: Users, color: 'text-green-600', bg: 'bg-green-100' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-lg`}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="text-center py-20">
                        <Award size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                        {filteredTests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                            >
                                {/* Card Header Color */}
                                <div className={`h-2 ${test.testType === 'PSYCHOMETRIC' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                        test.testType === 'INTERVIEW' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                            'bg-gradient-to-r from-blue-500 to-blue-600'
                                    }`}></div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Badge & Lock */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${test.testType === 'PSYCHOMETRIC' ? 'bg-purple-100 text-purple-700' :
                                                test.testType === 'INTERVIEW' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {test.testType === 'STANDARD' ? 'COURSE EXAM' : test.testType}
                                        </span>
                                        {test.isLocked ? (
                                            <Lock size={16} className="text-red-500" />
                                        ) : (
                                            <Unlock size={16} className="text-green-500" />
                                        )}
                                    </div>

                                    {/* Course Info (for Standard) */}
                                    {test.course && (
                                        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                            <GraduationCap size={14} />
                                            <span className="truncate">{test.course.title}</span>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {test.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                        {test.description || 'No description available'}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
                                        <div className="flex items-center gap-1">
                                            <FileQuestion size={16} />
                                            <span>{test.questionCount || 0} qs</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>{test.duration || 30} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Award size={16} />
                                            <span>{test.passingScore}%</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleStartTest(test)}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${test.isLocked
                                                ? 'bg-gray-800 hover:bg-black'
                                                : test.testType === 'PSYCHOMETRIC'
                                                    ? 'bg-purple-600 hover:bg-purple-700'
                                                    : test.testType === 'INTERVIEW'
                                                        ? 'bg-green-600 hover:bg-green-700'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                            } transform group-hover:scale-[1.02]`}
                                    >
                                        {test.isLocked ? (
                                            <>
                                                <Lock size={16} />
                                                {test.courseId ? 'Go to Course to Unlock' : 'Subscribe to Unlock'}
                                            </>
                                        ) : (
                                            'Start Test'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StandaloneTestsPage;
