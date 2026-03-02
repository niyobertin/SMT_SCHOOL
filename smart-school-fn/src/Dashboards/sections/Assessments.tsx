import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchAssessments, createAssessment, saveScores, submitResults } from "../../redux/features/assessments/assessmentSlice";
import { fetchClasses, fetchSubjects, fetchClassStudents } from "../../redux/features/academic/academicSlice";

export function Assessments() {
    // ...
    // (Skipping down to CreateAssessmentModal)
    // I will actually use a multi_replace for this to be safer. Wait, I'll just rewrite the import block and the `useEffect`/`handleSubmit` blocks. I'll abort this replace.
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);

    const dispatch = useAppDispatch();
    const { assessments, loading, error } = useAppSelector((state) => state.assessments);
    const { user } = useAppSelector((state) => state.auth);
    const schoolId = user?.schoolStaff?.[0]?.schoolId || user?.userOrganizations?.[0]?.organizationId;

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchAssessments({ schoolId }));
        }
    }, [dispatch, schoolId]);

    return (
        <div className="space-y-6 animate-fade-in custom-scrollbar">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight">
                        Assessments
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage tests, exams, and record student marks.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 bg-[#1a7ea5] text-white hover:bg-[#1a7ea5]/90 h-9 sm:h-10 px-4 py-2 shadow-lg shadow-[#1a7ea5]/20"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>New Assessment</span>
                </button>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-[#1a7ea5] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                </div>
            ) : assessments.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-[#1a7ea5]/10 rounded-full flex items-center justify-center mb-3">
                        <Plus className="text-[#1a7ea5]" size={24} />
                    </div>
                    <p className="text-slate-600 font-medium">No assessments found.</p>
                    <p className="text-slate-400 text-sm mt-1">Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((assessment: any) => (
                        <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#1a7ea5]/30 hover:shadow-xl hover:shadow-[#1a7ea5]/10 transition-all duration-300 flex flex-col group">
                            <div className="p-5 border-b border-slate-100 flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 uppercase tracking-wider">
                                        {assessment.type}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500">
                                        Max: {assessment.maxScore}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#1a7ea5] transition-colors line-clamp-1">
                                    {assessment.subject?.name || "Unknown Subject"}
                                </h3>

                                <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                                    <span className="font-medium bg-slate-50 px-2 py-1 rounded-md">{assessment.class?.name || "Unknown Class"}</span>
                                    <span>{assessment.term}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500">Status</span>
                                    <span className={`text-sm font-semibold ${assessment.scores?.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                        {assessment.scores?.length > 0 ? "Marks Entered" : "Pending Marks"}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelectedAssessment(assessment)}
                                    className="text-sm font-semibold text-[#1a7ea5] hover:text-[#135d7a] transition-colors"
                                >
                                    Manage Marks
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateAssessmentModal
                    schoolId={schoolId}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {selectedAssessment && (
                <ManageMarksModal
                    schoolId={schoolId}
                    assessment={selectedAssessment}
                    onClose={() => setSelectedAssessment(null)}
                />
            )}
        </div>
    );
}

function CreateAssessmentModal({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const { classes, subjects, loading: academicLoading } = useAppSelector((state) => state.academic);
    const [formData, setFormData] = useState({
        subjectId: "",
        classId: "",
        type: "TEST",
        term: "Term 1",
        maxScore: "100",
        date: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchClasses({ schoolId }));
            dispatch(fetchSubjects(schoolId));
        }
    }, [dispatch, schoolId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dispatch(createAssessment({
                schoolId,
                ...formData,
                maxScore: Number(formData.maxScore),
            })).unwrap();
            onClose();
        } catch (error) {
            console.error("Failed to create assessment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Create Assessment</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 max-h-[70vh]">
                    {academicLoading && classes.length === 0 ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-[#1a7ea5] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <form id="assessment-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                <select
                                    required
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                                <select
                                    required
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                >
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                    >
                                        <option value="TEST">Test</option>
                                        <option value="EXAM">Exam</option>
                                        <option value="QUIZ">Quiz</option>
                                        <option value="ASSIGNMENT">Assignment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Term</label>
                                    <select
                                        value={formData.term}
                                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                    >
                                        <option value="Term 1">Term 1</option>
                                        <option value="Term 2">Term 2</option>
                                        <option value="Term 3">Term 3</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Max Score</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.maxScore}
                                        onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="assessment-form"
                        disabled={isSubmitting || academicLoading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#1a7ea5] border border-transparent rounded-xl hover:bg-[#1a7ea5]/90 transition-colors shadow-lg shadow-[#1a7ea5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Create"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ManageMarksModal({ schoolId, assessment, onClose }: { schoolId: string; assessment: any; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const { classStudents, loading: academicLoading } = useAppSelector((state) => state.academic);
    // scores array format: [{ studentId: "...", score: 85 }]
    const [scores, setScores] = useState<any[]>(assessment.scores || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmittingResults, setIsSubmittingResults] = useState(false);

    useEffect(() => {
        if (schoolId && assessment.classId) {
            dispatch(fetchClassStudents({ schoolId, classId: assessment.classId }));
        }
    }, [dispatch, schoolId, assessment.classId]);

    const handleScoreChange = (studentId: string, value: string) => {
        const numValue = Number(value);
        if (numValue > assessment.maxScore) return;

        const existing = scores.find(s => s.studentId === studentId);
        if (existing) {
            setScores(scores.map(s => s.studentId === studentId ? { ...s, score: numValue } : s));
        } else {
            setScores([...scores, { studentId, score: numValue }]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dispatch(saveScores({
                assessmentId: assessment.id,
                data: { scores }
            })).unwrap();
            onClose();
        } catch (error) {
            console.error("Failed to save scores", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!confirm("Are you sure you want to finalize and submit these marks? You won't be able to edit them afterward.")) return;
        setIsSubmittingResults(true);
        try {
            await dispatch(submitResults({
                schoolId,
                classId: assessment.classId,
                term: assessment.term,
            })).unwrap();
            onClose();
        } catch (error) {
            console.error("Failed to submit results", error);
        } finally {
            setIsSubmittingResults(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Manage Marks: {assessment.subject?.name}</h2>
                        <p className="text-sm text-slate-500">{assessment.class?.name} - {assessment.term} | Max Score: {assessment.maxScore}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 max-h-[60vh]">
                    {academicLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-[#1a7ea5] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : classStudents.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No students found in this class.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold rounded-lg overflow-hidden">
                                    <tr>
                                        <th className="px-4 py-3 first:rounded-tl-lg">Student Name</th>
                                        <th className="px-4 py-3">Identifier</th>
                                        <th className="px-4 py-3 w-32 last:rounded-tr-lg">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classStudents.map((student: any) => {
                                        const currentScoreStr = scores.find(s => s.studentId === student.id)?.score?.toString() || "";
                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {student.user?.firstName} {student.user?.lastName}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{student.studentId || student.user?.username}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.maxScore}
                                                        value={currentScoreStr}
                                                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all text-center font-medium"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmittingResults || isSaving || academicLoading || scores.length === 0}
                        className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmittingResults ? <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div> : null}
                        Submit for Approval
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || isSubmittingResults || academicLoading}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#1a7ea5] border border-transparent rounded-xl hover:bg-[#1a7ea5]/90 transition-colors shadow-lg shadow-[#1a7ea5]/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                            Save Marks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
