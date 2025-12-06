import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, FileQuestion, Search, Filter as FilterIcon } from 'lucide-react';
import api from '../redux/api/api';

const StandaloneTestsPage = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'PSYCHOMETRIC' | 'INTERVIEW'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, [filterType]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tests', {
                params: {
                    standalone: true,
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
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartTest = (testId: string, testType: string) => {
        if (testType === 'INTERVIEW') {
            navigate(`/test/${testId}/interview`);
        } else {
            navigate(`/test/${testId}`);
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
                            Take psychometric and interview tests to evaluate your skills and knowledge
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
                                placeholder="Search tests..."
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
                                <option value="PSYCHOMETRIC">Psychometric</option>
                                <option value="INTERVIEW">Interview</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Tests</p>
                                <p className="text-3xl font-bold text-gray-900">{tests.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FileQuestion className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Psychometric</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {tests.filter(t => t.testType === 'PSYCHOMETRIC').length}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Award className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Interview</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {tests.filter(t => t.testType === 'INTERVIEW').length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FileQuestion className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>
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
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                {/* Card Header */}
                                <div className={`h-2 ${test.testType === 'PSYCHOMETRIC'
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                                        : 'bg-gradient-to-r from-green-500 to-green-600'
                                    }`}></div>

                                <div className="p-6">
                                    {/* Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${test.testType === 'PSYCHOMETRIC'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {test.testType}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {test.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {test.description || 'No description available'}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
                                        <div className="flex items-center gap-1">
                                            <FileQuestion size={16} />
                                            <span>{test._count?.questions || 0} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>{test.duration} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Award size={16} />
                                            <span>{test.passingScore}%</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleStartTest(test.id, test.testType)}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${test.testType === 'PSYCHOMETRIC'
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : 'bg-green-600 hover:bg-green-700'
                                            } transform group-hover:scale-105`}
                                    >
                                        Start Test
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
