import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchOrganizations,
    fetchExams,
    setSelectedOrg,
    fetchOpenEndedResponses,
    markAnswer
} from '../../redux/features/examAdminSlice';
import {
    Building2,
    FileText,
    Search,
    CheckCircle,
    AlertCircle,
    Save,
    Loader2,
    HelpCircle,
    Printer
} from 'lucide-react';
import { toast } from 'react-toastify';

const Marking = () => {
    const dispatch = useAppDispatch();
    const { organizations, exams, selectedOrg, openEndedResponses, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    const [selectedExamId, setSelectedExamId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [markingData, setMarkingData] = useState<{ [key: string]: { score: number | string; feedback: string } }>({});
    const [isExportingResponses, setIsExportingResponses] = useState(false);

    // Fetch Orgs on mount
    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    // Fetch Exams when Org changes
    useEffect(() => {
        if (selectedOrg) {
            dispatch(fetchExams(selectedOrg.id));
        }
    }, [selectedOrg, dispatch]);

    // Fetch Responses when Exam changes or on mount (for all)
    useEffect(() => {
        if (selectedExamId) {
            dispatch(fetchOpenEndedResponses(selectedExamId));
        } else {
            // By default, if admin or examiner, show all pending
            dispatch(fetchOpenEndedResponses('all'));
        }
    }, [selectedExamId, dispatch]);

    // Initialize markingData from responses
    useEffect(() => {
        if (openEndedResponses) {
            const initialData: { [key: string]: { score: number | string; feedback: string } } = {};
            openEndedResponses.forEach(r => {
                initialData[r.id] = {
                    score: r.manualScore !== null ? r.manualScore : '',
                    feedback: r.feedback || ''
                };
            });
            setMarkingData(initialData);
        }
    }, [openEndedResponses]);

    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const orgId = e.target.value;
        const org = organizations.find(o => o.id === orgId);
        if (org) dispatch(setSelectedOrg(org));
        setSelectedExamId('');
    };

    const handleMarkSubmit = async (answerId: string, maxPoints: number) => {
        const data = markingData[answerId];
        if (!data || data.score === '') {
            toast.error('Please enter a score');
            return;
        }

        const score = Number(data.score);
        if (score < 0 || score > maxPoints) {
            toast.error(`Score must be between 0 and ${maxPoints}`);
            return;
        }

        try {
            await dispatch(markAnswer({
                answerId,
                manualScore: score,
                feedback: data.feedback
            })).unwrap();
            toast.success('Mark saved successfully');
        } catch (error: any) {
            toast.error(error);
        }
    };

    const handleExportResponsesPDF = async () => {
        setIsExportingResponses(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('accessToken');

            const endpoint = selectedExamId
                ? `/api/exams/${selectedExamId}/open-ended-responses/export`
                : `/api/exams/all/open-ended-responses/export`;

            const response = await fetch(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Open_Ended_Responses_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Open-ended responses exported successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export PDF');
        } finally {
            setIsExportingResponses(false);
        }
    };

    const handleInputChange = (answerId: string, field: 'score' | 'feedback', value: string) => {
        setMarkingData(prev => ({
            ...prev,
            [answerId]: {
                ...prev[answerId],
                [field]: value
            }
        }));
    };

    // Filter responses
    const filteredResponses = openEndedResponses?.filter(response => {
        const searchLower = searchTerm.toLowerCase();
        return (
            response.examAttempt?.candidate?.firstName?.toLowerCase().includes(searchLower) ||
            response.examAttempt?.candidate?.lastName?.toLowerCase().includes(searchLower) ||
            response.examQuestion?.question?.toLowerCase().includes(searchLower)
        );
    }) || [];

    // Group by Candidate or Question? Let's just list them for now but grouped by Question looks organized.
    // Actually, marking by Question is often preferred to ensure consistency.
    // Sort by Question ID then Candidate Name.
    const sortedResponses = [...filteredResponses].sort((a, b) => {
        if (a.questionId !== b.questionId) return a.questionId.localeCompare(b.questionId);
        return a.examAttempt?.candidate?.lastName.localeCompare(b.examAttempt?.candidate?.lastName || '') || 0;
    });

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Marking</h1>
                    <p className="text-gray-600">Grade open-ended essay and short answer questions.</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <Building2 className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedOrg?.id || ''}
                            onChange={handleOrgChange}
                            className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">Select Organization</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                        <FileText className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            disabled={!selectedOrg}
                            className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                        >
                            <option value="">Select Exam</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search responses</label>
                        <Search className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Student name or question..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="w-full md:w-auto">
                        <button
                            onClick={handleExportResponsesPDF}
                            disabled={isExportingResponses || (!selectedExamId && sortedResponses.length === 0)}
                            className="w-full bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-gray-300 shadow-sm disabled:opacity-50"
                        >
                            {isExportingResponses ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading && !openEndedResponses?.length ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : sortedResponses.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No open responses found</h3>
                        <p className="text-gray-500 mt-1">There are no responses pending for manual marking in this exam.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedResponses.map((response) => {
                            const isMarked = response.manualScore !== null;
                            // Uses local state if available, else falls back to response data (though useEffect should catch this)
                            const inputValue = markingData[response.id]?.score ?? '';
                            const feedbackValue = markingData[response.id]?.feedback ?? '';

                            return (
                                <div key={response.id} className={`bg-white rounded-xl shadow-sm border ${isMarked ? 'border-green-200' : 'border-gray-200'} p-6 transition-all hover:shadow-md`}>
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                {response.examAttempt?.candidate?.firstName?.[0]}{response.examAttempt?.candidate?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{response.examAttempt?.candidate?.firstName} {response.examAttempt?.candidate?.lastName}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{response.examAttempt?.candidate?.candidateId || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(response.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isMarked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {isMarked ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {isMarked ? 'Marked' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm font-medium text-gray-900">{response.examQuestion?.question}</p>
                                        </div>
                                        <div className="pl-6">
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{response.answerText}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Score (Max: {response.examQuestion?.points})
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={response.examQuestion?.points}
                                                value={inputValue}
                                                onChange={(e) => handleInputChange(response.id, 'score', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-8">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Feedback (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={feedbackValue}
                                                onChange={(e) => handleInputChange(response.id, 'feedback', e.target.value)}
                                                placeholder="Enter performance feedback..."
                                                className="w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={() => handleMarkSubmit(response.id, response.examQuestion?.points)}
                                                disabled={loading}
                                                className="w-full bg-indigo-600 text-white rounded-lg py-2 px-3 text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marking;
