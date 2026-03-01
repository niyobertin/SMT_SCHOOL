import { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../redux/hooks';

// Custom Hooks
import {
    useExams,
    useCreateExam,
    useUpdateExam,
    useDeleteExam,
    useCandidates,
    useAssignCandidates
} from '../../hooks/useExams';
import api from '../../redux/api/api';

// Components
import { ExamTable } from './components/Exams/ExamTable';
import type { ExamFilters as FilterState } from '../../hooks/useExams';
import { ExamFilters } from './components/Exams/ExamFilters';
import { ExamFormModal } from './components/Exams/ExamFormModal';
import { QuestionManager } from './components/Exams/QuestionManager';
import { CandidateAssigner } from './components/Exams/CandidateAssigner';

const Exams = () => {
    // Global State
    const { selectedOrganizationId } = useAppSelector((state) => state.auth);

    // UI State
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        organizationId: selectedOrganizationId || '',
        status: '',
        archived: false
    });

    // Update filters when selectedOrganizationId changes
    useEffect(() => {
        setFilters(prev => ({ ...prev, organizationId: selectedOrganizationId || '' }));
    }, [selectedOrganizationId]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
    const [isAssignerOpen, setIsAssignerOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [candidateSearch, setCandidateSearch] = useState('');

    // Queries
    const { data: examsData, isLoading: examsLoading } = useExams(filters);
    const { data: candidatesData } = useCandidates({ search: candidateSearch });

    // Mutations
    const createExam = useCreateExam();
    const updateExam = useUpdateExam();
    const deleteExam = useDeleteExam();
    const assignCandidates = useAssignCandidates();

    // Handlers
    const handleCreateExam = async (data: any) => {
        try {
            const orgId = selectedOrganizationId || filters.organizationId;
            if (!orgId) return toast.error("Please select an organization first");
            await createExam.mutateAsync({ orgId, data });
            setIsFormOpen(false);
            toast.success("Exam created successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create exam");
        }
    };


    const handleUpdateExam = async (data: any) => {
        try {
            await updateExam.mutateAsync({ examId: selectedExam.id, data });
            setIsFormOpen(false);
            toast.success("Exam updated successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update exam");
        }
    };

    const handleDeleteExam = async (examId: string) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        try {
            await deleteExam.mutateAsync(examId);
            toast.success("Exam deleted");
        } catch (err: any) {
            toast.error("Failed to delete exam");
        }
    };

    const handleArchiveToggle = async (exam: any) => {
        try {
            await updateExam.mutateAsync({
                examId: exam.id,
                data: { status: exam.status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED' }
            });
            toast.success(exam.status === 'ARCHIVED' ? "Exam unarchived" : "Exam archived");
        } catch (err: any) {
            toast.error("Action failed");
        }
    };

    // Question Management delegated to QuestionManager component
    const handleAddQuestion = async (data: any) => {
        await api.post(`/exams/${selectedExam.id}/questions`, data);
        // React Query invalidation happens in useExams or manually here if needed
    };

    return (
        <div className="p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <span>Exams</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-900">All Assessments</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Exams</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage assessment cycles, questions, and candidate assignments.</p>
                </div>
                <button
                    onClick={() => { setSelectedExam(null); setIsFormOpen(true); }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Examination</span>
                </button>
            </header>

            {/* Filters */}
            <ExamFilters
                filters={filters}
                setFilters={setFilters}
            />

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <ExamTable
                    exams={examsData?.data || []}
                    loading={examsLoading}
                    onEdit={(exam) => { setSelectedExam(exam); setIsFormOpen(true); }}
                    onDelete={handleDeleteExam}
                    onArchive={handleArchiveToggle}
                    onManageQuestions={(examId) => {
                        setSelectedExam(examsData?.data?.find((e: any) => e.id === examId));
                        setIsQuestionManagerOpen(true);
                    }}
                    onAssignCandidates={(exam) => { setSelectedExam(exam); setIsAssignerOpen(true); }}
                    onCopyCode={(code) => { navigator.clipboard.writeText(code); toast.info("Code copied"); }}
                />
            </div>

            {/* Modals */}
            <ExamFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={selectedExam ? handleUpdateExam : handleCreateExam}
                initialData={selectedExam}
                isEditing={!!selectedExam}
                loading={createExam.isLoading || updateExam.isLoading}
            />

            {selectedExam && (
                <>
                    <QuestionManager
                        isOpen={isQuestionManagerOpen}
                        onClose={() => setIsQuestionManagerOpen(false)}
                        exam={selectedExam}
                        onAddQuestion={handleAddQuestion}
                        onUpdateQuestion={async (qId, data) => { await api.patch(`/exams/questions/${qId}`, data); }}
                        onDeleteQuestion={async (qId) => { await api.delete(`/exams/questions/${qId}`); }}
                        onBulkAdd={async (questions) => { await api.post(`/exams/${selectedExam.id}/questions/bulk`, { questions }); }}
                        loading={updateExam.isLoading || createExam.isLoading} // Re-using mutation loading for now as hooks are abstracted
                    />

                    <CandidateAssigner
                        isOpen={isAssignerOpen}
                        onClose={() => setIsAssignerOpen(false)}
                        exam={selectedExam}
                        candidates={candidatesData?.data || []}
                        search={candidateSearch}
                        onSearchChange={setCandidateSearch}
                        onAssign={async (ids) => { await assignCandidates.mutateAsync({ examId: selectedExam.id, candidateIds: ids }); }}
                        loading={assignCandidates.isLoading}
                    />
                </>
            )}
        </div>
    );
};

export default Exams;
