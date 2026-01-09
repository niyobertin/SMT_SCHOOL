
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchAllExams,
    createExam,
    setSelectedOrg,
    updateExam,
    deleteExam,
    deleteQuestion,
    addQuestion,
    updateQuestion,
    fetchExamDetails,
    fetchAllCandidates,
    archiveExam,
    unarchiveExam,
    bulkAssignExam,
    fetchExamAssignedCandidates,
    bulkAddQuestions,
} from '../../redux/features/examAdminSlice';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Clock,
    Copy,
    CheckSquare,
    Square,
    UserPlus,
    Edit,
    Trash2,
    X,
    Users,
    Filter,
    Building2,
    Search,
    ChevronDown,
    HelpCircle,
    AlertTriangle,
    Upload,
    Loader2,
    Archive,
    Undo,
    MoreVertical
} from 'lucide-react';

const Exams = () => {
    const dispatch = useAppDispatch();
    const { organizations, selectedOrg, exams, selectedExam, candidates, assignedCandidateIds, loading, candidatesPagination } = useAppSelector(
        (state) => state.examAdmin
    );
    const { user } = useAppSelector((state) => state.auth);

    // Filter State
    const [filters, setFilters] = useState({
        organizationId: '',
        search: '',
        status: '', // ALL, DRAFT, PUBLISHED
        date: '',
        archived: false
    });
    const [actionMenuOpen, setActionMenuOpen] = useState<any>(null);
    // Modal States
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
    // Assignment Filters
    const [assignFilters, setAssignFilters] = useState({
        search: '',
        batch: '',
        grade: '',
        department: '',
        page: 1,
        limit: 20
    });

    // Exam CRUD States
    const [isEditingExam, setIsEditingExam] = useState(false);
    const [showDeleteExamModal, setShowDeleteExamModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    // Fetch Exams on Filter Change
    useEffect(() => {
        const fetchParams: any = {
            organizationId: filters.organizationId || undefined,
            status: filters.status || undefined,
            search: filters.search || undefined,
            date: filters.date || undefined,
            archived: filters.archived
        };
        dispatch(fetchAllExams(fetchParams));
    }, [dispatch, filters]);

    // Handler for Organization Selection (updates filters AND redux selectedOrg for other components if needed)
    const handleOrgFilterChange = (orgId: string) => {
        setFilters(prev => ({ ...prev, organizationId: orgId }));
        const org = organizations.find((o) => o.id === orgId);
        if (org) dispatch(setSelectedOrg(org));
        else dispatch(setSelectedOrg(null));
    };

    // --- FORM STATES & HANDLERS ---
    const [examForm, setExamForm] = useState({
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        maxAttempts: 3,
        status: 'DRAFT',
        examCode: '',
        instructions: '',
        startDate: '',
    });

    const [questionForm, setQuestionForm] = useState({
        question: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        explanation: '',
        options: [{ option: '', isCorrect: false }, { option: '', isCorrect: false }],
    });

    const handleCreateExamClick = () => {
        if (!selectedOrg && !filters.organizationId) {
            toast.warning('Please select an Organization first to create an exam.');
            return;
        }
        resetExamForm();
        setShowCreateExamModal(true);
    };

    const handleEditExam = (exam: any) => {
        setExamForm({
            title: exam.title,
            description: exam.description || '',
            duration: exam.duration,
            passingScore: exam.passingScore,
            maxAttempts: exam.maxAttempts || 3,
            status: exam.status || 'DRAFT',
            examCode: exam.examCode || '',
            instructions: Array.isArray(exam.instructions) ? exam.instructions.join('\n') : (exam.instructions || ''),
            startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : '',
        });
        setSelectedExamId(exam.id);
        setIsEditingExam(true);
        // Ensure org is selected if we edit
        if (exam.organizationId && (!selectedOrg || selectedOrg.id !== exam.organizationId)) {
            const org = organizations.find(o => o.id === exam.organizationId);
            if (org) dispatch(setSelectedOrg(org));
        }
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
            toast.success('Exam deleted');
            setShowDeleteExamModal(false);
            setExamToDelete(null);
            // Refresh
            dispatch(fetchAllExams(filters));
        } catch (error: any) {
            toast.error(error || 'Failed to delete');
        }
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const orgId = selectedOrg?.id || filters.organizationId;
        if (!orgId && !isEditingExam) {
            toast.error('Organization required');
            return;
        }

        try {
            if (isEditingExam && selectedExamId) {
                await dispatch(updateExam({
                    examId: selectedExamId,
                    data: {
                        ...examForm,
                        instructions: examForm.instructions.split('\n').filter(line => line.trim() !== '')
                    }
                })).unwrap();
                toast.success('Exam updated!');
            } else {
                await dispatch(createExam({
                    orgId: orgId!,
                    data: {
                        ...examForm,
                        instructions: examForm.instructions.split('\n').filter(line => line.trim() !== ''),
                        randomizeQuestions: true,
                        showResults: true,
                        allowReview: true
                    }
                })).unwrap();
                toast.success('Exam created!');
            }
            setShowCreateExamModal(false);
            resetExamForm();
            dispatch(fetchAllExams(filters));
        } catch (error: any) {
            toast.error(error || 'Failed to save exam');
        }
    };

    const resetExamForm = () => {
        setExamForm({ title: '', description: '', duration: 60, passingScore: 70, maxAttempts: 3, status: 'DRAFT', examCode: '', instructions: '', startDate: '' });
        setIsEditingExam(false);
        setSelectedExamId('');
    };

    const handleOpenManageQuestions = async (examId: string) => {
        setSelectedExamId(examId);
        await dispatch(fetchExamDetails(examId));
        setQuestionViewMode('LIST');
        setShowManageQuestionsModal(true);
    };

    const handleEditQuestion = (question: any) => {
        setQuestionForm({
            question: question.question,
            type: question.type,
            points: question.points,
            explanation: question.explanation || '',
            options: question.options.map((opt: any) => ({ option: opt.option, isCorrect: opt.isCorrect })),
        });
        setQuestionIdToEdit(question.id);
        setIsEditingQuestion(true);
        setQuestionViewMode('FORM');
    };

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditingQuestion && questionIdToEdit) {
                await dispatch(updateQuestion({ examId: selectedExamId, questionId: questionIdToEdit, data: questionForm })).unwrap();
                toast.success('Updated question');
            } else {
                await dispatch(addQuestion({ examId: selectedExamId, data: questionForm })).unwrap();
                toast.success('Added question');
            }
            setQuestionViewMode('LIST');
            resetQuestionForm();
        } catch (error: any) {
            toast.error(error);
        }
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            question: '', type: 'MULTIPLE_CHOICE', points: 1, explanation: '',
            options: [{ option: '', isCorrect: false }, { option: '', isCorrect: false }]
        });
        setIsEditingQuestion(false);
        setQuestionIdToEdit(null);
    };

    const handleDeleteQuestionClick = (questionId: string) => {
        setQuestionToDelete(questionId);
        setShowDeleteQuestionModal(true);
    };

    const handleConfirmDeleteQuestion = async () => {
        if (questionToDelete && selectedExamId) {
            try {
                await dispatch(deleteQuestion({ examId: selectedExamId, questionId: questionToDelete })).unwrap();
                toast.success('Question deleted');
                setShowDeleteQuestionModal(false);
            } catch (error: any) {
                toast.error(error || 'Failed to delete question');
            }
        }
    }

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedExamId) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Mapping columns to expected backend fields
                const formattedQuestions = data.map((row: any) => {
                    const optionsRaw = row.Options || '';
                    const options = optionsRaw.toString().split('|').map((optStr: string) => {
                        const lastCommaIndex = optStr.lastIndexOf(',');
                        if (lastCommaIndex === -1) return { option: optStr.trim(), isCorrect: false };

                        const text = optStr.substring(0, lastCommaIndex).trim();
                        const correct = optStr.substring(lastCommaIndex + 1).trim().toLowerCase();
                        return { option: text, isCorrect: correct === 'true' || correct === '1' || correct === 'yes' };
                    }).filter((o: any) => o.option);

                    const type = (row.Type || 'MULTIPLE_CHOICE').toString().toUpperCase().replace(/\s+/g, '_');

                    return {
                        question: row.Question || row.question || 'Untitled Question',
                        type: type,
                        points: Number(row.Points || row.points || 1),
                        explanation: row.Explanation || row.explanation || '',
                        options: options.length > 0 ? options : []
                    };
                });

                await dispatch(bulkAddQuestions({ examId: selectedExamId, questions: formattedQuestions })).unwrap();
                toast.success(`Successfully uploaded ${formattedQuestions.length} questions`);
                await dispatch(fetchExamDetails(selectedExamId));
            } catch (error: any) {
                toast.error('Failed to parse Excel file. Ensure it follows the required format.');
                console.error(error);
            }
        };
        reader.readAsBinaryString(file);
        // Reset file input
        e.target.value = '';
    };

    // --- ASSIGNMENT HANDLERS ---
    const handleAssignCandidates = async () => {
        if (selectedCandidateIds.length === 0) return;
        try {
            await dispatch(bulkAssignExam({ examId: selectedExamForAssign.id, candidateIds: selectedCandidateIds })).unwrap();
            toast.success(`Assigned ${selectedCandidateIds.length} candidates`);
            setShowAssignModal(false);
            setSelectedCandidateIds([]);
        } catch (error: any) { toast.error(error); }
    };

    const toggleCandidateSelection = (id: string) => {
        // Don't toggle if already assigned
        if (assignedCandidateIds.includes(id)) return;
        setSelectedCandidateIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAllCandidates = () => {
        const unassignedCandidates = candidates.filter(c => !assignedCandidateIds.includes(c.id));
        if (selectedCandidateIds.length === unassignedCandidates.length) {
            setSelectedCandidateIds([]);
        } else {
            setSelectedCandidateIds(unassignedCandidates.map(c => c.id));
        }
    };

    const downloadQuestionTemplate = () => {
        const template = [
            {
                Question: 'What is the capital of France?',
                Type: 'MULTIPLE_CHOICE',
                Points: 1,
                Explanation: 'Paris is the capital of France.',
                Options: 'Paris,true | London,false | Berlin,false | Madrid,false'
            },
            {
                Question: 'The earth is flat.',
                Type: 'TRUE_FALSE',
                Points: 1,
                Explanation: 'The earth is an oblate spheroid.',
                Options: 'True,false | False,true'
            },
            {
                Question: 'Explain the process of photosynthesis.',
                Type: 'ESSAY',
                Points: 5,
                Explanation: 'Photosynthesis is the process used by plants to convert light energy into chemical energy.',
                Options: ''
            },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "question_template.xlsx");
    };

    const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
                    <p className="text-gray-600 mt-1">Manage exams, questions, and assignments</p>
                </div>
                <button
                    onClick={handleCreateExamClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Create Exam
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

                {/* Search */}
                <div className="relative col-span-1 md:col-span-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Organization Filter */}
                {user?.role !== 'EXAMINER' && (
                    <div className="col-span-1 md:col-span-1">
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                value={filters.organizationId}
                                onChange={(e) => handleOrgFilterChange(e.target.value)}
                                className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                            >
                                <option value="">All Organizations</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Status Filter */}
                <div className="col-span-1 md:col-span-1">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                        <input
                            type="checkbox"
                            checked={filters.archived}
                            onChange={(e) => setFilters({ ...filters, archived: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Show Archived</span>
                    </label>
                </div>
            </div>

            {/* List View Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl">Exam Title</th>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4">Questions</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading exams...</td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                        <span className="text-gray-500 font-medium">No exams found</span>
                                        <p className="text-gray-400 text-xs mt-1">Try adjusting filters or create a new exam.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (

                            exams.map((exam: any) => {
                                return (
                                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{exam.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{exam.examCode}</code>
                                                    <button onClick={() => copyToClipboard(exam.examCode)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded">
                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {exam.organization?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {exam.duration}m
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {exam._count?.questions || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const spaceBelow = window.innerHeight - rect.bottom;
                                                            const position = spaceBelow < 250 ? 'up' : 'down';
                                                            setActionMenuOpen(actionMenuOpen?.id === exam.id ? null : { id: exam.id, position });
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${actionMenuOpen?.id === exam.id ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {actionMenuOpen?.id === exam.id && (
                                                        <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in ${actionMenuOpen.position === 'up' ? 'bottom-full mb-1 slide-in-from-bottom-2' : 'top-full mt-1 slide-in-from-top-2'
                                                            }`}>
                                                            <div className="p-2 border-b border-gray-50 flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => { setActionMenuOpen(null); handleOpenManageQuestions(exam.id); }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <FileText className="w-4 h-4" /> Manage Questions
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuOpen(null);
                                                                        setSelectedExamForAssign(exam);
                                                                        setAssignFilters({
                                                                            search: '',
                                                                            batch: '',
                                                                            grade: '',
                                                                            department: '',
                                                                            page: 1,
                                                                            limit: 20
                                                                        });
                                                                        dispatch(fetchAllCandidates({
                                                                            organizationId: exam.organizationId,
                                                                            page: 1,
                                                                            limit: 20
                                                                        }));
                                                                        dispatch(fetchExamAssignedCandidates(exam.id));
                                                                        setShowAssignModal(true);
                                                                        setSelectedCandidateIds([]);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <UserPlus className="w-4 h-4" /> Assign Candidates
                                                                </button>
                                                            </div>
                                                            <div className="p-1">
                                                                <button
                                                                    onClick={() => { setActionMenuOpen(null); handleEditExam(exam); }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <Edit className="w-4 h-4" /> Edit Exam
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        setActionMenuOpen(null);
                                                                        try {
                                                                            if (exam.status === 'ARCHIVED') {
                                                                                await dispatch(unarchiveExam(exam.id)).unwrap();
                                                                                toast.success('Exam unarchived');
                                                                            } else {
                                                                                await dispatch(archiveExam(exam.id)).unwrap();
                                                                                toast.success('Exam archived');
                                                                            }
                                                                            const fetchParams: any = {
                                                                                organizationId: filters.organizationId || undefined,
                                                                                status: filters.status || undefined,
                                                                                search: filters.search || undefined,
                                                                                date: filters.date || undefined,
                                                                                archived: filters.archived
                                                                            };
                                                                            dispatch(fetchAllExams(fetchParams));
                                                                        } catch (e: any) { toast.error(e); }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    {exam.status === 'ARCHIVED' ? <Undo className="w-4 h-4 text-green-600" /> : <Archive className="w-4 h-4 text-amber-600" />}
                                                                    {exam.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                                                                </button>
                                                                <div className="my-1 border-t border-gray-100" />
                                                                <button
                                                                    onClick={() => { setActionMenuOpen(null); handleDeleteExamClick(exam.id); }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Overlay to close when clicking outside */}
                                                    {actionMenuOpen?.id === exam.id && (
                                                        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table >
            </div >

            {/* Modals are kept below (CreateExam, Assign, ManageQuestions, DeleteConfirms) */}
            {/* Create Exam Modal */}
            <AnimatePresence>
                {showCreateExamModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                                <h3 className="text-xl font-bold">{isEditingExam ? 'Edit Exam' : 'Create Exam'}</h3>
                                <button onClick={() => setShowCreateExamModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="exam-form" onSubmit={handleExamSubmit} className="space-y-4">
                                    <div><label className="block text-sm font-medium mb-1">Title</label><input className="w-full border rounded-lg p-2" value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Exam Code</label>
                                            <input
                                                className="w-full border rounded-lg p-2 font-mono uppercase bg-gray-50 cursor-not-allowed"
                                                value={isEditingExam ? examForm.examCode : 'AUTO-GEN'}
                                                disabled
                                                placeholder="System Generated"
                                            />
                                        </div>
                                        <div><label className="block text-sm font-medium mb-1">Status</label>
                                            <select
                                                className="w-full border rounded-lg p-2 bg-white"
                                                value={examForm.status}
                                                onChange={e => setExamForm({ ...examForm, status: e.target.value })}
                                            >
                                                <option value="DRAFT">Draft</option>
                                                <option value="PUBLISHED">Published</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="w-full border rounded-lg p-2" rows={2} value={examForm.description} onChange={e => setExamForm({ ...examForm, description: e.target.value })} /></div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            placeholder="Enter instructions, one per line..."
                                            value={examForm.instructions}
                                            onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Each line will be shown as a separate bullet point.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" className="w-full border rounded-lg p-2" value={examForm.duration} onChange={e => setExamForm({ ...examForm, duration: parseInt(e.target.value) })} required /></div>
                                        <div><label className="block text-sm font-medium mb-1">Pass Score (%)</label><input type="number" className="w-full border rounded-lg p-2" value={examForm.passingScore} onChange={e => setExamForm({ ...examForm, passingScore: parseInt(e.target.value) })} required /></div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start Time (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                                            value={examForm.startDate}
                                            onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">If set, candidates will see a waiting screen until this time.</p>
                                    </div>
                                </form>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateExamModal(false); resetExamForm(); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="exam-form"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {isEditingExam ? 'Update Exam' : 'Save Exam'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Exam Modal */}
            <AnimatePresence>
                {showDeleteExamModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 text-center max-w-sm">
                            <h3 className="text-lg font-bold mb-2">Delete Exam?</h3>
                            <p className="text-gray-600 mb-6 text-sm">Cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowDeleteExamModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                                <button
                                    onClick={handleConfirmDeleteExam}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Questions Modal (Simplified View for Context) */}
            <AnimatePresence>
                {showManageQuestionsModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <div>
                                    <h3 className="text-xl font-bold">Manage Questions</h3>
                                    <p className="text-sm text-gray-500">Adding/Editing questions</p>
                                </div>
                                <button onClick={() => setShowManageQuestionsModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {questionViewMode === 'LIST' ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <button onClick={() => { resetQuestionForm(); setQuestionViewMode('FORM'); }} className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors">
                                                <Plus className="w-5 h-5" /> Add New Question
                                            </button>
                                            <button
                                                onClick={downloadQuestionTemplate}
                                                className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors"
                                            >
                                                Download Template
                                            </button>
                                            <div className="relative flex-1">
                                                <input
                                                    type="file"
                                                    id="excel-upload"
                                                    className="hidden"
                                                    accept=".xlsx, .xls"
                                                    onChange={handleExcelUpload}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('excel-upload')?.click()}
                                                    disabled={loading}
                                                    className="w-full h-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-500 flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                    Upload from Excel
                                                </button>
                                            </div>
                                        </div>
                                        {selectedExam?.questions && selectedExam.questions.length > 0 ? (
                                            <div className="space-y-4">
                                                {selectedExam.questions.map((q: any, idx: number) => (
                                                    <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 group relative">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                                    {q.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditQuestion(q)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteQuestionClick(q.id)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-900 font-medium mb-3">{q.question}</p>
                                                        {q.options && q.options.length > 0 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {q.options.map((opt: any, oIdx: number) => (
                                                                    <div
                                                                        key={opt.id || oIdx}
                                                                        className={`text-xs p-2 rounded flex items-center gap-2 ${opt.isCorrect ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-white border border-gray-100 text-gray-500'}`}
                                                                    >
                                                                        {opt.isCorrect ? <CheckSquare className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                                                                        {opt.option}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-indigo-600">{q.points} Points</span>
                                                            {q.explanation && (
                                                                <span className="text-[10px] text-gray-400 italic">Has Explanation</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p>No questions added to this exam yet.</p>
                                                <p className="text-xs">Click the button above to start building your exam.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleQuestionSubmit} className="space-y-4">
                                        <div><label className="block text-sm font-medium">Question Text</label><textarea className="w-full border rounded p-2" value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} required /></div>
                                        <div className="flex gap-4">
                                            <div className="flex-1"><label className="block text-sm font-medium">Points</label><input type="number" className="w-full border rounded p-2" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} /></div>
                                            <div className="flex-1"><label className="block text-sm font-medium">Type</label><select className="w-full border rounded p-2" value={questionForm.type} onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })}><option value="MULTIPLE_CHOICE">Multiple Choice</option><option value="TRUE_FALSE">True/False</option><option value="SHORT_ANSWER">Short Answer</option><option value="ESSAY">Essay</option></select></div>
                                        </div>
                                        {(questionForm.type === 'MULTIPLE_CHOICE' || questionForm.type === 'TRUE_FALSE') && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium">Options</label>
                                                {questionForm.options.map((opt, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input className="flex-1 border rounded p-2" placeholder={`Option ${idx + 1}`} value={opt.option} onChange={e => {
                                                            const newOpts = [...questionForm.options]; newOpts[idx].option = e.target.value; setQuestionForm({ ...questionForm, options: newOpts });
                                                        }} />
                                                        <input type="checkbox" checked={opt.isCorrect} onChange={e => {
                                                            const newOpts = [...questionForm.options]; newOpts[idx].isCorrect = e.target.checked; setQuestionForm({ ...questionForm, options: newOpts });
                                                        }} className="w-6 h-6 my-auto accent-green-600" />
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, { option: '', isCorrect: false }] })} className="text-sm text-indigo-600">+ Add Option</button>
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-4">
                                            <button type="button" onClick={() => setQuestionViewMode('LIST')} className="flex-1 py-2 border rounded">Cancel</button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 py-2 bg-indigo-600 text-white rounded flex items-center justify-center gap-2"
                                            >
                                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 h-[80vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Assign Candidates</h3>
                                    <p className="text-sm text-gray-500 mt-1">Select candidates to assign to <strong>{selectedExamForAssign?.title}</strong></p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="border rounded-lg p-2 text-sm"
                                    value={assignFilters.search}
                                    onChange={e => {
                                        const newFilters = { ...assignFilters, search: e.target.value, page: 1 };
                                        setAssignFilters(newFilters);
                                        dispatch(fetchAllCandidates({ ...newFilters, organizationId: selectedExamForAssign?.organizationId }));
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Batch (e.g. 2025-A)"
                                    className="border rounded-lg p-2 text-sm"
                                    value={assignFilters.batch}
                                    onChange={e => {
                                        const newFilters = { ...assignFilters, batch: e.target.value, page: 1 };
                                        setAssignFilters(newFilters);
                                        dispatch(fetchAllCandidates({ ...newFilters, organizationId: selectedExamForAssign?.organizationId }));
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Grade"
                                    className="border rounded-lg p-2 text-sm"
                                    value={assignFilters.grade}
                                    onChange={e => {
                                        const newFilters = { ...assignFilters, grade: e.target.value, page: 1 };
                                        setAssignFilters(newFilters);
                                        dispatch(fetchAllCandidates({ ...newFilters, organizationId: selectedExamForAssign?.organizationId }));
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Dept"
                                    className="border rounded-lg p-2 text-sm"
                                    value={assignFilters.department}
                                    onChange={e => {
                                        const newFilters = { ...assignFilters, department: e.target.value, page: 1 };
                                        setAssignFilters(newFilters);
                                        dispatch(fetchAllCandidates({ ...newFilters, organizationId: selectedExamForAssign?.organizationId }));
                                    }}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6 pr-2 -mr-2 custom-scrollbar">
                                <div className="space-y-3">
                                    {candidates.map(c => {
                                        const isAssigned = assignedCandidateIds.includes(c.id);
                                        const isSelected = selectedCandidateIds.includes(c.id);

                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => toggleCandidateSelection(c.id)}
                                                className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${isAssigned
                                                    ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                                                        : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    {isAssigned ? (
                                                        <div className="p-1 bg-green-100 rounded text-green-600">
                                                            <CheckSquare className="w-5 h-5" />
                                                        </div>
                                                    ) : isSelected ? (
                                                        <div className="text-indigo-600">
                                                            <CheckSquare className="w-6 h-6" />
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-300 group-hover:text-gray-400">
                                                            <Square className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                            {c.firstName} {c.lastName}
                                                        </p>
                                                        {isAssigned && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                                                                Already Assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="font-mono text-xs">{c.candidateId}</span>
                                                        <span>•</span>
                                                        <span className="truncate">{c.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {candidates.length === 0 && (
                                        <div className="text-center py-12">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No candidates found for this organization.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination */}
                            {candidatesPagination && (
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                                    <button
                                        onClick={() => {
                                            const newPage = Math.max(1, assignFilters.page - 1);
                                            setAssignFilters({ ...assignFilters, page: newPage });
                                            dispatch(fetchAllCandidates({ ...assignFilters, page: newPage, organizationId: selectedExamForAssign?.organizationId }));
                                        }}
                                        disabled={assignFilters.page === 1 || loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-600">
                                        Page {candidatesPagination.page} of {candidatesPagination.pages} ({candidatesPagination.total} candidates)
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newPage = Math.min(candidatesPagination.pages, assignFilters.page + 1);
                                            setAssignFilters({ ...assignFilters, page: newPage });
                                            dispatch(fetchAllCandidates({ ...assignFilters, page: newPage, organizationId: selectedExamForAssign?.organizationId }));
                                        }}
                                        disabled={assignFilters.page >= candidatesPagination.pages || loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <button
                                    onClick={selectAllCandidates}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    {selectedCandidateIds.length === candidates.filter(c => !assignedCandidateIds.includes(c.id)).length && candidates.filter(c => !assignedCandidateIds.includes(c.id)).length > 0
                                        ? 'Deselect All'
                                        : 'Select All Unassigned'}
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-6 py-2.5 border-2 border-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssignCandidates}
                                        disabled={selectedCandidateIds.length === 0 || loading}
                                        className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Assign {selectedCandidateIds.length > 0 && `(${selectedCandidateIds.length})`}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Question Confirmation Modal */}
            <AnimatePresence>
                {showDeleteQuestionModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Question?</h3>
                                <p className="text-gray-500 mb-8">
                                    Are you sure you want to delete this question? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteQuestionModal(false)}
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDeleteQuestion}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default Exams;
