import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchExams,
    createExam,
    setSelectedOrg,
    updateExam,
    deleteExam,
    updateQuestion, // Even if not used yet, good to have
    deleteQuestion, // Even if not used yet, good to have
    addQuestion,
    fetchCandidates,
    fetchExamAssignedCandidates,
    bulkAssignExam,
    fetchExamDetails,
    fetchDashboardStats,
} from '../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Clock,
    Target,
    Copy,
    CheckSquare,
    Square,
    UserPlus,
    Edit,
    Trash2,
    X,
} from 'lucide-react';
import DashboardStats from '../../components/exam-admin/DashboardStats';

const Exams = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, exams, candidates, assignedCandidateIds, loading, selectedExam, dashboardStats } = useAppSelector(
        (state) => state.examAdmin
    );

    const [showCreateExamModal, setShowCreateExamModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [showManageQuestionsModal, setShowManageQuestionsModal] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'LIST' | 'FORM'>('LIST');
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [questionIdToEdit, setQuestionIdToEdit] = useState<string | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
    const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
    const [selectedExamForAssign, setSelectedExamForAssign] = useState<any>(null);
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

    const [isEditingExam, setIsEditingExam] = useState(false);
    const [showDeleteExamModal, setShowDeleteExamModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState<string | null>(null);

    const [examForm, setExamForm] = useState({
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        maxAttempts: 3,
    });

    const [questionForm, setQuestionForm] = useState({
        question: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        explanation: '',
        options: [
            { option: '', isCorrect: false },
            { option: '', isCorrect: false },
        ],
    });

    useEffect(() => {
        dispatch(fetchOrganizations());
        dispatch(fetchDashboardStats(selectedOrg?.id));
    }, [dispatch, selectedOrg?.id]);

    useEffect(() => {
        if (selectedOrg) {
            dispatch(fetchExams(selectedOrg.id));
            dispatch(fetchCandidates(selectedOrg.id));
        }
    }, [selectedOrg, dispatch]);

    const handleEditExam = (exam: any) => {
        setExamForm({
            title: exam.title,
            description: exam.description || '',
            duration: exam.duration,
            passingScore: exam.passingScore,
            maxAttempts: exam.maxAttempts || 3,
        });
        setSelectedExamId(exam.id);
        setIsEditingExam(true);
        setShowCreateExamModal(true);
    };

    const handleDeleteExamClick = (examId: string) => {
        setExamToDelete(examId);
        setShowDeleteExamModal(true);
    };

    const handleConfirmDeleteExam = async () => {
        if (!examToDelete) return;
        try {
            await dispatch(deleteExam(examToDelete)).unwrap();
            toast.success('Exam deleted successfully');
            setShowDeleteExamModal(false);
            setExamToDelete(null);
        } catch (error: any) {
            toast.error(error || 'Failed to delete exam');
        }
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) {
            toast.error('Please select an organization first');
            return;
        }

        try {
            if (isEditingExam && selectedExamId) {
                await dispatch(
                    updateExam({
                        examId: selectedExamId,
                        data: examForm
                    })
                ).unwrap();
                toast.success('Exam updated successfully!');
            } else {
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
            }

            setShowCreateExamModal(false);
            resetExamForm();
            dispatch(fetchExams(selectedOrg.id));
        } catch (error: any) {
            toast.error(error || `Failed to ${isEditingExam ? 'update' : 'create'} exam`);
        }
    };

    const resetExamForm = () => {
        setExamForm({
            title: '',
            description: '',
            duration: 60,
            passingScore: 70,
            maxAttempts: 3,
        });
        setIsEditingExam(false);
        setSelectedExamId('');
    };

    const handleOpenManageQuestions = async (examId: string) => {
        setSelectedExamId(examId);
        await dispatch(fetchExamDetails(examId)); // Fetch full details including questions
        setQuestionViewMode('LIST');
        setShowManageQuestionsModal(true);
    };

    const handleEditQuestion = (question: any) => {
        setQuestionForm({
            question: question.question,
            type: question.type,
            points: question.points,
            explanation: question.explanation || '',
            options: question.options.map((opt: any) => ({
                option: opt.option,
                isCorrect: opt.isCorrect
            })),
        });
        setQuestionIdToEdit(question.id);
        setIsEditingQuestion(true);
        setQuestionViewMode('FORM');
    };

    const handleDeleteQuestionClick = (questionId: string) => {
        setQuestionToDelete(questionId);
        setShowDeleteQuestionModal(true);
    };

    const handleConfirmDeleteQuestion = async () => {
        if (!questionToDelete || !selectedExamId) return;
        try {
            await dispatch(deleteQuestion({ examId: selectedExamId, questionId: questionToDelete })).unwrap();
            toast.success('Question deleted successfully');
            setShowDeleteQuestionModal(false);
            setQuestionToDelete(null);
        } catch (error: any) {
            toast.error(error || 'Failed to delete question');
        }
    };

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditingQuestion && questionIdToEdit) {
                await dispatch(
                    updateQuestion({
                        examId: selectedExamId,
                        questionId: questionIdToEdit,
                        data: questionForm
                    })
                ).unwrap();
                toast.success('Question updated successfully!');
            } else {
                await dispatch(
                    addQuestion({ examId: selectedExamId, data: questionForm })
                ).unwrap();
                toast.success('Question added successfully!');
            }

            setQuestionViewMode('LIST'); // Return to list view
            resetQuestionForm();
        } catch (error: any) {
            toast.error(error || `Failed to ${isEditingQuestion ? 'update' : 'add'} question`);
        }
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            question: '',
            type: 'MULTIPLE_CHOICE',
            points: 1,
            explanation: '',
            options: [
                { option: '', isCorrect: false },
                { option: '', isCorrect: false },
            ],
        });
        setIsEditingQuestion(false);
        setQuestionIdToEdit(null);
    };

    const handleAssignCandidates = async () => {
        if (selectedCandidateIds.length === 0) {
            toast.error('Please select at least one candidate');
            return;
        }

        try {
            // Bulk assign selected candidates
            await dispatch(
                bulkAssignExam({
                    examId: selectedExamForAssign.id,
                    candidateIds: selectedCandidateIds
                })
            ).unwrap();

            toast.success(`Successfully assigned ${selectedCandidateIds.length} candidate(s)!`);
            setShowAssignModal(false);
            setSelectedCandidateIds([]);
            setSelectedExamForAssign(null);
        } catch (error: any) {
            toast.error(error || 'Failed to assign candidates');
        }
    };

    const toggleCandidateSelection = (candidateId: string) => {
        setSelectedCandidateIds((prev) =>
            prev.includes(candidateId)
                ? prev.filter((id) => id !== candidateId)
                : [...prev, candidateId]
        );
    };

    const selectAllCandidates = () => {
        if (selectedCandidateIds.length === candidates.length) {
            setSelectedCandidateIds([]);
        } else {
            setSelectedCandidateIds(candidates.map((c) => c.id));
        }
    };

    const addOption = () => {
        setQuestionForm({
            ...questionForm,
            options: [...questionForm.options, { option: '', isCorrect: false }],
        });
    };

    const removeOption = (index: number) => {
        setQuestionForm({
            ...questionForm,
            options: questionForm.options.filter((_, i) => i !== index),
        });
    };

    const updateOption = (index: number, field: string, value: any) => {
        const newOptions = [...questionForm.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setQuestionForm({ ...questionForm, options: newOptions });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Management</h1>
                <p className="text-gray-600">Create and manage exams with questions</p>
            </div>

            {/* Dashboard Stats */}
            {dashboardStats && <DashboardStats stats={dashboardStats} />}

            {/* Organization Selector */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Organization
                </label>
                <select
                    value={selectedOrg?.id || ''}
                    onChange={(e) => {
                        const org = organizations.find((o) => o.id === e.target.value);
                        dispatch(setSelectedOrg(org));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Choose an organization...</option>
                    {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                            {org.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedOrg && (
                <>
                    {/* Create Exam Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => {
                                resetExamForm();
                                setShowCreateExamModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Create Exam
                        </button>
                    </div>

                    {/* Exams List */}
                    <div className="space-y-4">
                        {exams.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Exams Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first exam to get started
                                </p>
                            </div>
                        ) : (
                            exams.map((exam) => (
                                <motion.div
                                    key={exam.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {exam.title}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${exam.status === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {exam.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">{exam.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm mb-4">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{exam.duration} min</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Target className="w-4 h-4" />
                                                    <span>Pass: {exam.passingScore}%</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{exam._count?.questions || 0} questions</span>
                                                </div>
                                            </div>

                                            {/* Exam Code */}
                                            <div className="flex items-center gap-2">
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

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedExamForAssign(exam);
                                                    dispatch(fetchCandidates(exam.organizationId)); // Ensure we have candidates for this org
                                                    dispatch(fetchExamAssignedCandidates(exam.id)); // Fetch existing assignments
                                                    setShowAssignModal(true);
                                                    setSelectedCandidateIds([]);
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Assign
                                            </button>
                                            <button
                                                onClick={() => handleOpenManageQuestions(exam.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4 inline mr-1" />
                                                Manage Questions
                                            </button>
                                            <button
                                                onClick={() => handleEditExam(exam)}
                                                className="p-2 hover:bg-gray-100 rounded-lg" title="Edit Exam">
                                                <Edit className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExamClick(exam.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg" title="Delete Exam">
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Assign Candidates Modal */}
            <AnimatePresence>
                {showAssignModal && selectedExamForAssign && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Assign Candidates</h3>
                                    <p className="text-gray-600 mt-1">
                                        Select candidates for: <strong>{selectedExamForAssign.title}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCandidateIds([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Select All */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <button
                                    onClick={selectAllCandidates}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                                >
                                    {selectedCandidateIds.length === candidates.length ? (
                                        <>
                                            <CheckSquare className="w-5 h-5" />
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-5 h-5" />
                                            Select All ({candidates.length})
                                        </>
                                    )}
                                </button>
                                <p className="text-sm text-gray-600 mt-2">
                                    {selectedCandidateIds.length} candidate(s) selected
                                </p>
                            </div>

                            {/* Candidates List */}
                            <div className="space-y-2 mb-6">
                                {candidates.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No candidates found for this organization</p>
                                    </div>
                                ) : (
                                    candidates.map((candidate) => {
                                        const isSelected = selectedCandidateIds.includes(candidate.id);
                                        const isAlreadyAssigned = assignedCandidateIds.includes(candidate.id);

                                        return (
                                            <button
                                                key={candidate.id}
                                                onClick={() => !isAlreadyAssigned && toggleCandidateSelection(candidate.id)} // Prevent selection if assigned
                                                disabled={isAlreadyAssigned} // Disable button
                                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex items-center gap-4 ${isAlreadyAssigned
                                                    ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' // Disabled style
                                                    : isSelected
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    {isAlreadyAssigned ? (
                                                        <CheckSquare className="w-6 h-6 text-gray-400" /> // Show checked but disabled
                                                    ) : isSelected ? (
                                                        <CheckSquare className="w-6 h-6 text-indigo-600" />
                                                    ) : (
                                                        <Square className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {candidate.firstName} {candidate.lastName}
                                                        </h4>
                                                        {isAlreadyAssigned && (
                                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                                Assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                                        <span>{candidate.email}</span>
                                                        <code className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                            {candidate.candidateId}
                                                        </code>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCandidateIds([]);
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignCandidates}
                                    disabled={selectedCandidateIds.length === 0 || loading}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading
                                        ? 'Assigning...'
                                        : `Assign ${selectedCandidateIds.length} Candidate(s)`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Exam Modal */}
            <AnimatePresence>
                {showCreateExamModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {isEditingExam ? 'Edit Exam' : 'Create New Exam'}
                                </h3>
                                <button
                                    onClick={() => setShowCreateExamModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleExamSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Exam Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={examForm.title}
                                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Introduction to Programming"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={examForm.description}
                                        onChange={(e) =>
                                            setExamForm({ ...examForm, description: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Brief description of the exam"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration (min) *
                                        </label>
                                        <input
                                            type="number"
                                            value={examForm.duration}
                                            onChange={(e) =>
                                                setExamForm({ ...examForm, duration: parseInt(e.target.value) })
                                            }
                                            required
                                            min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Passing Score (%) *
                                        </label>
                                        <input
                                            type="number"
                                            value={examForm.passingScore}
                                            onChange={(e) =>
                                                setExamForm({
                                                    ...examForm,
                                                    passingScore: parseInt(e.target.value),
                                                })
                                            }
                                            required
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Attempts
                                        </label>
                                        <input
                                            type="number"
                                            value={examForm.maxAttempts}
                                            onChange={(e) =>
                                                setExamForm({
                                                    ...examForm,
                                                    maxAttempts: parseInt(e.target.value),
                                                })
                                            }
                                            min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateExamModal(false)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? (isEditingExam ? 'Updating...' : 'Creating...') : (isEditingExam ? 'Update Exam' : 'Create Exam')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Exam Confirmation Modal */}
            <AnimatePresence>
                {showDeleteExamModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Exam?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this exam? This action cannot be undone and will delete all associated questions and results.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteExamModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDeleteExam}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Questions Modal */}
            <AnimatePresence>
                {showManageQuestionsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {questionViewMode === 'LIST' ? 'Manage Questions' : (isEditingQuestion ? 'Edit Question' : 'Add Question')}
                                    </h3>
                                    {questionViewMode === 'FORM' && (
                                        <button
                                            onClick={() => {
                                                setQuestionViewMode('LIST');
                                                resetQuestionForm();
                                            }}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            &larr; Back to List
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowManageQuestionsModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* LOADING STATE - Wait for selectedExam to be populated */}
                            {!selectedExam || selectedExam.id !== selectedExamId ? (
                                <div className="flex justify-center py-12">
                                    <p className="text-gray-500">Loading exam details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* LIST VIEW */}
                                    {questionViewMode === 'LIST' && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <p className="text-gray-600">
                                                    Questions for <strong>{selectedExam.title}</strong> ({selectedExam.questions?.length || 0})
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        resetQuestionForm();
                                                        setQuestionViewMode('FORM');
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add New Question
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {selectedExam.questions && selectedExam.questions.length > 0 ? (
                                                    selectedExam.questions.map((q: any, index: number) => (
                                                        <div key={q.id} className="p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-bold text-gray-900">Q{index + 1}.</span>
                                                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                                            {q.type.replace('_', ' ')}
                                                                        </span>
                                                                        <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                                            {q.points} pts
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-800 font-medium mb-2">{q.question}</p>
                                                                    <div className="ml-6 space-y-1">
                                                                        {q.options?.map((opt: any, i: number) => (
                                                                            <div key={i} className={`text-sm flex items-center gap-2 ${opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                                                                {opt.isCorrect && <CheckSquare className="w-3 h-3" />}
                                                                                {opt.option}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEditQuestion(q)}
                                                                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg" title="Edit">
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteQuestionClick(q.id)}
                                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                                        <p className="text-gray-500">No questions added yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* FORM VIEW */}
                                    {questionViewMode === 'FORM' && (
                                        <form onSubmit={handleQuestionSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Question *
                                                </label>
                                                <textarea
                                                    value={questionForm.question}
                                                    onChange={(e) =>
                                                        setQuestionForm({ ...questionForm, question: e.target.value })
                                                    }
                                                    required
                                                    rows={3}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Enter your question here"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Question Type *
                                                    </label>
                                                    <select
                                                        value={questionForm.type}
                                                        onChange={(e) =>
                                                            setQuestionForm({ ...questionForm, type: e.target.value })
                                                        }
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    >
                                                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                                        <option value="TRUE_FALSE">True/False</option>
                                                        <option value="SHORT_ANSWER">Short Answer</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Points *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={questionForm.points}
                                                        onChange={(e) =>
                                                            setQuestionForm({
                                                                ...questionForm,
                                                                points: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        required
                                                        min="0.5"
                                                        step="0.5"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            {/* Options (for MCQ and True/False) */}
                                            {(questionForm.type === 'MULTIPLE_CHOICE' ||
                                                questionForm.type === 'TRUE_FALSE') && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Answer Options
                                                        </label>
                                                        <div className="space-y-2">
                                                            {questionForm.options.map((opt, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={opt.isCorrect}
                                                                        onChange={(e) =>
                                                                            updateOption(index, 'isCorrect', e.target.checked)
                                                                        }
                                                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={opt.option}
                                                                        onChange={(e) => updateOption(index, 'option', e.target.value)}
                                                                        placeholder={`Option ${index + 1}`}
                                                                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    />
                                                                    {questionForm.options.length > 2 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeOption(index)}
                                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {questionForm.type === 'MULTIPLE_CHOICE' && (
                                                            <button
                                                                type="button"
                                                                onClick={addOption}
                                                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                            >
                                                                + Add Option
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Explanation (optional)
                                                </label>
                                                <textarea
                                                    value={questionForm.explanation}
                                                    onChange={(e) =>
                                                        setQuestionForm({ ...questionForm, explanation: e.target.value })
                                                    }
                                                    rows={2}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Explain the correct answer"
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setQuestionViewMode('LIST');
                                                        resetQuestionForm();
                                                    }}
                                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                                >
                                                    {isEditingQuestion ? 'Update Question' : 'Add Question'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Question Confirmation Modal */}
            <AnimatePresence>
                {showDeleteQuestionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Question?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this question? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteQuestionModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDeleteQuestion}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Exams;
