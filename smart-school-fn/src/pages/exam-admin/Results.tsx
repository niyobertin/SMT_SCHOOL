
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchGlobalExamResults,
    fetchOrganizations,
    fetchExams,
    setSelectedOrg,
    authorizeRetake,
} from '../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    Building2,
    Download,
    Filter,
    FileText,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RotateCcw,
    AlertTriangle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Results = () => {
    const dispatch = useAppDispatch();
    const {
        organizations,
        exams,
        globalResults,
        loading
    } = useAppSelector((state) => state.examAdmin);
    const { user } = useAppSelector((state) => state.auth);

    const [filters, setFilters] = useState({
        organizationId: '',
        examId: '',
        startDate: '',
        endDate: '',
        status: 'ALL', // ALL, PASSED, FAILED
        batch: ''
    });
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingDetailed, setIsExportingDetailed] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        assignmentId: string;
        candidateName: string;
        allowRetake: boolean;
    }>({ show: false, assignmentId: '', candidateName: '', allowRetake: false });
    useEffect(() => {
        dispatch(fetchOrganizations());
        if (user?.role === 'EXAMINER') {
            dispatch(fetchExams('all')); // Or perhaps the backend handles fetching exams from all assigned orgs
        }
    }, [dispatch, user?.role]);

    // Fetch exams when org changes
    useEffect(() => {
        if (filters.organizationId) {
            dispatch(fetchExams(filters.organizationId));
        }
    }, [filters.organizationId, dispatch]);

    // Fetch results when filters change (debounced slightly or manual trigger?)
    // Manual trigger or auto-fetch on filter change is better.
    // Let's do auto-fetch.
    useEffect(() => {
        const fetchParams: any = {
            page,
            limit,
            startDate: filters.startDate,
            endDate: filters.endDate,
            status: filters.status !== 'ALL' ? filters.status : undefined,
            organizationId: filters.organizationId || undefined,
            examId: filters.examId || undefined,
            batch: filters.batch || undefined
        };

        dispatch(fetchGlobalExamResults(fetchParams));
    }, [dispatch, page, limit, filters.organizationId, filters.examId, filters.startDate, filters.endDate, filters.status]);

    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const orgId = e.target.value;
        setFilters(prev => ({ ...prev, organizationId: orgId, examId: '' }));
        // Also update redux selected org if needed for consistency, though this page manages local filter state mostly
        const org = organizations.find(o => o.id === orgId);
        if (org) dispatch(setSelectedOrg(org));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to page 1 on filter change
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (!globalResults?.data) return;
        setIsExportingExcel(true);
        try {
            const dataToExport = globalResults.data.map((attempt: any, index: number) => ({
                Position: index + 1,
                'Candidate ID': attempt.candidate.customCandidateId || attempt.candidate.candidateId,
                'First Name': attempt.candidate.firstName,
                'Last Name': attempt.candidate.lastName,
                'Email': attempt.candidate.email || 'N/A',
                'Exam Title': attempt.exam.title,
                'Batch': attempt.candidate.batch || 'N/A',
                'Score (%)': attempt.score?.toFixed(2),
                'Status': attempt.status,
                'Date': new Date(attempt.createdAt).toLocaleDateString(),
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Exam Results");

            // Add average score row if meta exists
            if (globalResults.meta) {
                XLSX.utils.sheet_add_aoa(ws, [
                    [],
                    ['Average Score:', `${Math.round(globalResults.meta.averageScore * 10) / 10}%`],
                    ['Total Candidates:', globalResults.meta.total]
                ], { origin: -1 });
            }

            XLSX.writeFile(wb, `Exam_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export Excel');
        } finally {
            setIsExportingExcel(false);
        }
    };

    // Export to PDF
    const handleExportPDF = () => {
        if (!globalResults?.data) return;
        setIsExportingPDF(true);
        try {
            const doc = new jsPDF();
            // Title
            doc.setFontSize(18);
            doc.text('Exam Results Report', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            const dateStr = `Generated on: ${new Date().toLocaleDateString()}`;
            doc.text(dateStr, 14, 28);

            // Filter Context
            let yPos = 35;
            if (filters.organizationId) {
                const orgName = organizations.find(o => o.id === filters.organizationId)?.name || 'Unknown Org';
                doc.text(`Organization: ${orgName}`, 14, yPos);
                yPos += 5;
            }
            if (filters.examId) {
                const examTitle = exams.find(e => e.id === filters.examId)?.title || 'Unknown Exam';
                doc.text(`Exam: ${examTitle}`, 14, yPos);
                yPos += 5;
            }

            // Table
            const tableColumn = ["Pos", "ID", "Candidate Name", "Exam", "Score", "Status"];
            const tableRows = globalResults.data.map((attempt: any, index: number) => [
                index + 1,
                attempt.candidate.customCandidateId || attempt.candidate.candidateId,
                `${attempt.candidate.firstName} ${attempt.candidate.lastName}`,
                attempt.exam.title,
                `${attempt.score?.toFixed(2)}%`,
                attempt.status
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: yPos + 5,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
            });

            // Summary Footer
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(11);
            doc.setTextColor(0);
            if (globalResults.meta) {
                doc.text(`Average Score: ${Math.round(globalResults.meta.averageScore * 100) / 100}%`, 14, finalY);
                doc.text(`Total Candidates: ${globalResults.meta.total}`, 14, finalY + 7);
            }

            doc.save(`Exam_Results_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleExportDetailedPDF = async () => {
        if (!filters.examId) {
            toast.error('Please select an exam first');
            return;
        }

        setIsExportingDetailed(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${baseUrl}/api/exams/${filters.examId}/results/detailed`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Export failed' }));
                throw new Error(err.message || 'Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Detailed_Results_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Detailed report exported successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export PDF');
        } finally {
            setIsExportingDetailed(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
                    <p className="text-gray-600">View, filter, and export candidate performance reports.</p>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-end flex-wrap">
                    {/* Organization Filter */}
                    {user?.role !== 'EXAMINER' && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    name="organizationId"
                                    value={filters.organizationId}
                                    onChange={handleOrgChange}
                                    className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">All Organizations</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Exam Filter */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                name="examId"
                                value={filters.examId}
                                onChange={handleFilterChange}
                                disabled={!filters.organizationId}
                                className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">All Exams</option>
                                {exams.map(exam => (
                                    <option key={exam.id} value={exam.id}>{exam.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="pl-9 w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PASSED">Passed</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExportingPDF}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-200 disabled:opacity-50"
                        >
                            {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={isExportingExcel}
                            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200 disabled:opacity-50"
                        >
                            {isExportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Excel
                        </button>
                        <button
                            onClick={handleExportDetailedPDF}
                            disabled={!filters.examId || isExportingDetailed}
                            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2 border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!filters.examId ? "Select an exam to export detailed results" : "Export Detailed Results Report"}
                        >
                            {isExportingDetailed ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Report
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                    {loading && (!globalResults?.data || globalResults.data.length === 0) ? (
                        <div className="p-12 flex flex-col justify-center items-center text-gray-500 min-h-[400px]">
                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
                            <p className="font-medium">Fetching examination results...</p>
                        </div>
                    ) : globalResults?.data && globalResults.data.length > 0 ? (
                        <>
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <div className="bg-white p-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-3 pr-5">
                                        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                                        <span className="text-sm font-semibold text-gray-700">Updating...</span>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Pos</th>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Candidate Name</th>
                                            <th className="px-6 py-4">Exam Info</th>
                                            <th className="px-6 py-4">Score (%)</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {globalResults.data.map((attempt: any, index: number) => (
                                            <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {(page - 1) * limit + index + 1}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-indigo-600 bg-indigo-50/50">
                                                    {attempt.candidate.candidateId}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                            {attempt.candidate.firstName[0]}{attempt.candidate.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{attempt.candidate.firstName} {attempt.candidate.lastName}</p>
                                                            <p className="text-xs text-gray-400">{attempt.candidate.email || attempt.candidate.phoneNumber || '-'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-700 font-medium">{attempt.exam.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-gray-900">{attempt.score?.toFixed(2)}%</span>
                                                        <span className="text-[10px] text-gray-400">Pass: {attempt.exam.passingScore}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        {attempt.isMarkingPending ? (
                                                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                Marking Pending
                                                            </div>
                                                        ) : attempt.isPassed ? (
                                                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Pass
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                                <XCircle className="w-3 h-3" />
                                                                Fail
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(attempt.startTime).toLocaleDateString()}
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(attempt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {attempt.assignment && (
                                                        <button
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    show: true,
                                                                    assignmentId: attempt.assignment.id,
                                                                    candidateName: attempt.candidate.firstName,
                                                                    allowRetake: !attempt.assignment.allowRetake
                                                                });
                                                            }}
                                                            disabled={loading}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${attempt.assignment.allowRetake
                                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title={attempt.assignment.allowRetake ? 'Unauthorized Retake' : 'Authorize Retake'}
                                                        >
                                                            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                                            {attempt.assignment.allowRetake ? 'Authorized' : 'Authorize Retake'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {globalResults?.pagination && globalResults.pagination.pages > 1 && (
                                <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, globalResults.pagination.total)}</span> of <span className="font-medium">{globalResults.pagination.total}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(globalResults?.pagination?.pages || 1, p + 1))}
                                            disabled={page === (globalResults?.pagination?.pages || 1)}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center min-h-[400px] flex flex-col justify-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Results Found</h3>
                            <p className="text-gray-500">Try adjusting your filters to see candidate results.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-gray-100"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                                    {confirmModal.allowRetake ? 'Authorize Retake?' : 'Revoke Authorization?'}
                                </h3>
                                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                    Are you sure you want to {confirmModal.allowRetake ? 'grant an additional attempt' : 'remove retake permission'} for <strong>{confirmModal.candidateName}</strong>?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                        className="flex-1 px-6 py-3.5 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            dispatch(authorizeRetake({
                                                assignmentId: confirmModal.assignmentId,
                                                allowRetake: confirmModal.allowRetake
                                            })).then((res: any) => {
                                                if (res.payload?.status === 'success') {
                                                    toast.success(res.payload.message);
                                                }
                                                setConfirmModal({ ...confirmModal, show: false });
                                            });
                                        }}
                                        className={`flex-1 px-6 py-3.5 ${confirmModal.allowRetake ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Results;
