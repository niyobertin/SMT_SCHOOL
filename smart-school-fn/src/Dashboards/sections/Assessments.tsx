import { useState, useEffect } from "react";
import { Plus, GraduationCap, ClipboardCheck, Users, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchAssessments, createAssessment, saveScores, submitResults } from "../../redux/features/assessments/assessmentSlice";
import { fetchClasses, fetchSubjects, fetchClassStudents } from "../../redux/features/academic/academicSlice";
import { StatsCard } from "../StatsCard";

export function Assessments() {
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

    // Calculate stats
    const totalAssessments = assessments.length;
    const pendingMarks = assessments.filter((a: any) => !a.scores || a.scores.length === 0).length;
    const highScorers = assessments.filter((a: any) => {
        if (!a.scores || a.scores.length === 0) return false;
        const avg = a.scores.reduce((acc: number, s: any) => acc + s.score, 0) / a.scores.length;
        return avg > (a.maxScore * 0.8);
    }).length;

    return (
        <div className="space-y-8 animate-fade-in custom-scrollbar">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Assessments</h1>
                    <p className="text-slate-500 font-medium mt-3">Manage tests, exams, and record student performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                    >
                        <Plus size={16} />
                        New Assessment
                    </button>
                </div>
            </div>

            {/* High-Level Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Checks"
                    value={totalAssessments}
                    icon={ClipboardCheck}
                    color="bg-blue-500"
                    change="Assessments"
                />
                <StatsCard
                    title="Pending Marks"
                    value={pendingMarks}
                    icon={TrendingUp}
                    color="bg-amber-500"
                    change="Action Needed"
                />
                <StatsCard
                    title="Excellence Rate"
                    value={highScorers}
                    icon={GraduationCap}
                    color="bg-emerald-500"
                    change="High Performers"
                />
                <StatsCard
                    title="Participation"
                    value={`${totalAssessments > 0 ? 100 : 0}%`}
                    icon={Users}
                    color="bg-purple-500"
                    change="Engagement"
                />
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#1a7ea5] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl text-sm font-bold border border-rose-100 shadow-sm animate-shake">
                    {error}
                </div>
            ) : assessments.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-16 text-center flex flex-col items-center justify-center shadow-sm">
                    <div className="h-20 w-20 bg-[#1a7ea5]/5 rounded-3xl flex items-center justify-center mb-6">
                        <ClipboardCheck className="text-[#1a7ea5]" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No assessments yet</h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-sm">Create your first assessment to begin tracking student academic progress.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assessments.map((assessment: any) => (
                        <div key={assessment.id} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden hover:border-[#1a7ea5]/20 hover:shadow-2xl hover:shadow-[#1a7ea5]/5 transition-all duration-500 flex flex-col group relative">
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${assessment.type === 'EXAM' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                        {assessment.type}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                        <span className="text-slate-900">{assessment.maxScore}</span>
                                        <span>Max Pts</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1a7ea5] transition-colors line-clamp-1 tracking-tight">
                                    {assessment.subject?.name || "Unknown Subject"}
                                </h3>

                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-6">
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{assessment.class?.name || "Unknown Class"}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span>{assessment.term}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grading Status</span>
                                    <span className={`text-xs font-black uppercase tracking-tighter mt-0.5 ${assessment.scores?.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                        {assessment.scores?.length > 0 ? "Entry Complete" : "Pending Entry"}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelectedAssessment(assessment)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-[#1a7ea5] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#1a7ea5] hover:text-white hover:border-[#1a7ea5] transition-all shadow-sm active:scale-95"
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
