import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchExams,
    fetchCandidates,
    setSelectedOrg,
    createExam,
} from '../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    FileText,
    Plus,
    Eye,
    BarChart3,
    Copy,
    CheckCircle,
} from 'lucide-react';

const ExamAdminDashboard = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, exams, candidates, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    const [showCreateExam, setShowCreateExam] = useState(false);
    const [examForm, setExamForm] = useState({
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
    });

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    useEffect(() => {
        if (selectedOrg) {
            dispatch(fetchExams(selectedOrg.id));
            dispatch(fetchCandidates(selectedOrg.id));
        }
    }, [selectedOrg, dispatch]);

    const handleSelectOrg = (org: any) => {
        dispatch(setSelectedOrg(org));
    };

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) {
            toast.error('Please select an organization first');
            return;
        }

        try {
            await dispatch(
                createExam({
                    orgId: selectedOrg.id,
                    data: {
                        ...examForm,
                        randomizeQuestions: true,
                        showResults: true,
                        allowReview: true,
                    },
                })
            ).unwrap();

            toast.success('Exam created successfully!');
            setShowCreateExam(false);
            setExamForm({ title: '', description: '', duration: 60, passingScore: 70 });
            dispatch(fetchExams(selectedOrg.id));
        } catch (error: any) {
            toast.error(error || 'Failed to create exam');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Administration</h1>
                    <p className="text-gray-600">Manage organizations, exams, and candidates</p>
                </div>

                {/* Organizations Grid */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Organizations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {organizations.map((org) => (
                            <motion.button
                                key={org.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleSelectOrg(org)}
                                className={`p-6 rounded-xl border-2 transition-all text-left ${selectedOrg?.id === org.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                    }`}
                            >
                                <h3 className="font-semibold text-gray-900 mb-2">{org.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{org.description}</p>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span>📝 Exams: {org._count?.exams || 0}</span>
                                    <span>👥 Candidates: {org._count?.candidates || 0}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {selectedOrg && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                                        <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
                                    </div>
                                    <FileText className="w-12 h-12 text-blue-600 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
                                        <p className="text-3xl font-bold text-green-600">{candidates.length}</p>
                                    </div>
                                    <Users className="w-12 h-12 text-green-600 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Published</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {exams.filter((e) => e.status === 'PUBLISHED').length}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-12 h-12 text-purple-600 opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* Exams Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Exams for {selectedOrg.name}
                                </h2>
                                <button
                                    onClick={() => setShowCreateExam(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Exam
                                </button>
                            </div>

                            {/* Exams List */}
                            <div className="space-y-3">
                                {exams.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        No exams yet. Create your first exam!
                                    </p>
                                ) : (
                                    exams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-3">{exam.description}</p>

                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            ⏱️ {exam.duration} min
                                                        </span>
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            🎯 Pass: {exam.passingScore}%
                                                        </span>
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            📊 Questions: {exam._count?.questions || 0}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${exam.status === 'PUBLISHED'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}
                                                        >
                                                            {exam.status}
                                                        </span>
                                                    </div>

                                                    {/* Exam Code */}
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm">
                                                            {exam.examCode}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(exam.examCode)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Copy className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <Eye className="w-5 h-5 text-gray-600" />
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <BarChart3 className="w-5 h-5 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Candidates Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Candidates
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {candidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {candidate.firstName} {candidate.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">{candidate.email}</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                                {candidate.candidateId}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(candidate.candidateId)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Create Exam Modal */}
                {showCreateExam && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Exam</h3>

                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Title
                                    </label>
                                    <input
                                        type="text"
                                        value={examForm.title}
                                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Introduction to Programming"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={examForm.description}
                                        onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief description of the exam"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={examForm.duration}
                                            onChange={(e) =>
                                                setExamForm({ ...examForm, duration: parseInt(e.target.value) })
                                            }
                                            required
                                            min="1"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Passing Score (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={examForm.passingScore}
                                            onChange={(e) =>
                                                setExamForm({ ...examForm, passingScore: parseInt(e.target.value) })
                                            }
                                            required
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateExam(false)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Exam'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamAdminDashboard;
