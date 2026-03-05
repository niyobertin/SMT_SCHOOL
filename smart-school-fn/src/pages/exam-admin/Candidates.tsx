import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchAllCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    archiveCandidate,
    unarchiveCandidate,
    bulkCreateCandidates,
    fetchOrganizations,
} from '../../redux/features/examAdminSlice';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Mail,
    Phone,
    X,
    Copy,
    Upload,
    Loader2,
    Filter,
    Archive,
    Undo,
    MoreVertical,
} from 'lucide-react';

const Candidates = () => {
    const dispatch = useAppDispatch();
    const { candidates, organizations, loading } = useAppSelector(
        (state) => state.examAdmin
    );
    const { user } = useAppSelector((state) => state.auth);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [filterBatch, setFilterBatch] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        organizationId: '',
        candidateId: '',
        batch: '',
        grade: '',
        department: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    // Auto-select first org for examiners if none selected
    useEffect(() => {
        if (user?.role === 'EXAMINER' && !selectedOrgId && organizations.length > 0) {
            setSelectedOrgId(organizations[0].id);
        }
    }, [user?.role, organizations, selectedOrgId]);

    useEffect(() => {
        const fetchParams: any = {
            organizationId: selectedOrgId || undefined,
            search: searchTerm || undefined,
            batch: filterBatch || undefined,
            grade: filterGrade || undefined,
            department: filterDepartment || undefined,
            archived: showArchived,
        };
        dispatch(fetchAllCandidates(fetchParams));

    }, [selectedOrgId, searchTerm, filterBatch, filterGrade, filterDepartment, showArchived, dispatch]);

    const handleEdit = (candidate: any) => {
        setFormData({
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phoneNumber: candidate.phoneNumber || '',
            organizationId: candidate.organizationId || '',
            candidateId: candidate.candidateId || '',
            batch: candidate.batch || '',
            grade: candidate.grade || '',
            department: candidate.department || '',
        });
        setSelectedCandidate(candidate);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleDeleteClick = (candidateId: string) => {
        setCandidateToDelete(candidateId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!candidateToDelete) return;
        try {
            await dispatch(deleteCandidate(candidateToDelete)).unwrap();
            toast.success('Candidate deleted successfully');
            setShowDeleteModal(false);
            setCandidateToDelete(null);
        } catch (error: any) {
            toast.error(error || 'Failed to delete candidate');
        }
    };

    const handleArchiveToggle = async (candidate: any) => {
        try {
            if (candidate.isArchived) {
                await dispatch(unarchiveCandidate(candidate.id)).unwrap();
                toast.success('Candidate unarchived successfully');
            } else {
                await dispatch(archiveCandidate(candidate.id)).unwrap();
                toast.success('Candidate archived successfully');
            }
            // Refresh list
            const fetchParams: any = {
                organizationId: selectedOrgId || undefined,
                search: searchTerm || undefined,
                batch: filterBatch || undefined,
                grade: filterGrade || undefined,
                department: filterDepartment || undefined,
                archived: showArchived,
            };
            dispatch(fetchAllCandidates(fetchParams));
        } catch (error: any) {
            toast.error(error || `Failed to ${candidate.isArchived ? 'unarchive' : 'archive'} candidate`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const orgToUse = isEditing ? selectedCandidate.organizationId : (formData.organizationId || selectedOrgId);

        if (!orgToUse && !isEditing) {
            toast.error('Please select an organization');
            return;
        }

        try {
            if (isEditing && selectedCandidate) {
                await dispatch(updateCandidate({ candidateId: selectedCandidate.id, data: formData })).unwrap();
                toast.success('Candidate updated successfully!');
            } else {
                await dispatch(createCandidate({ orgId: orgToUse, data: formData })).unwrap();
                toast.success('Candidate created successfully!');
            }
            setShowCreateModal(false);
            resetForm();

            // Refresh list
            const fetchParams: any = {
                organizationId: selectedOrgId || undefined,
                search: searchTerm || undefined,
                batch: filterBatch || undefined,
                grade: filterGrade || undefined,
                department: filterDepartment || undefined,
                archived: showArchived,
            };
            dispatch(fetchAllCandidates(fetchParams));
        } catch (error: any) {
            toast.error(error || `Failed to ${isEditing ? 'update' : 'create'} candidate`);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', email: '', phoneNumber: '', organizationId: '',
            candidateId: '', batch: '', grade: '', department: ''
        });
        setIsEditing(false);
        setSelectedCandidate(null);
    };

    const downloadTemplate = () => {
        const template = [
            {
                FirstName: 'John',
                LastName: 'Doe',
                Email: 'john@example.com',
                PhoneNumber: '1234567890',
                CustomID: 'CAND-001',
                Batch: '2025-A',
                Grade: '12',
                Department: 'Engineering'
            },
            {
                FirstName: 'Jane',
                LastName: 'Smith',
                Email: 'jane@example.com',
                PhoneNumber: '0987654321',
                CustomID: 'CAND-002',
                Batch: '2025-A',
                Grade: '12',
                Department: 'Product'
            },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Candidates");
        XLSX.writeFile(wb, "candidate_template.xlsx");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const orgId = selectedOrgId || formData.organizationId;

        if (!file) return;
        if (!orgId) {
            toast.warning('Please select an organization first for bulk upload.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Mapping columns to expected backend fields
                const formattedCandidates = data.map((row: any) => ({
                    firstName: row.FirstName || row.firstName || '',
                    lastName: row.LastName || row.lastName || '',
                    email: row.Email || row.email || '',
                    phoneNumber: row.PhoneNumber !== undefined ? String(row.PhoneNumber) : '',
                    candidateId: row.CustomID || row.customCandidateId || '',
                    customCandidateId: row.CustomID || row.customCandidateId || '',
                    batch: row.Batch || row.batch || '',
                    grade: row.Grade !== undefined ? String(row.Grade) : '',
                    department: row.Department || row.department || '',
                })).filter(c => c.firstName && c.lastName);

                if (formattedCandidates.length === 0) {
                    toast.error('No valid candidates found in the Excel file.');
                    return;
                }

                await dispatch(bulkCreateCandidates({ orgId, candidates: formattedCandidates })).unwrap();
                toast.success(`Successfully uploaded ${formattedCandidates.length} candidates`);

                // Refresh list
                dispatch(fetchAllCandidates({ organizationId: orgId }));
            } catch (error: any) {
                toast.error('Failed to parse Excel file. Ensure it follows the required format (FirstName, LastName, Email, PhoneNumber).');
                console.error(error);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    // We use server side filtering now for search too, but kept local filter for super smooth feel if already loaded
    const filteredCandidates = candidates;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Management</h1>
                <p className="text-gray-600">Manage exam candidates and assignments</p>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search candidates..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {user?.role !== 'EXAMINER' && (
                        <div className="min-w-[240px]">
                            <select
                                value={selectedOrgId}
                                onChange={(e) => setSelectedOrgId(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white font-medium text-gray-700"
                            >
                                <option value="">All Organizations</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl transition-all font-medium ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Add Candidate
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Batch</label>
                                    <input
                                        type="text"
                                        value={filterBatch}
                                        onChange={(e) => setFilterBatch(e.target.value)}
                                        placeholder="e.g. 2025-A"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Grade</label>
                                    <input
                                        type="text"
                                        value={filterGrade}
                                        onChange={(e) => setFilterGrade(e.target.value)}
                                        placeholder="e.g. 10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Department</label>
                                    <input
                                        type="text"
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                        placeholder="e.g. Science"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={showArchived}
                                            onChange={(e) => setShowArchived(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Show Archived</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-2 justify-end">
                    <input
                        type="file"
                        id="candidate-excel-upload"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                    />
                    <button
                        onClick={downloadTemplate}
                        className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
                    >
                        Download Template
                    </button>
                    <button
                        onClick={() => document.getElementById('candidate-excel-upload')?.click()}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Bulk Upload
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-visible">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tl-xl">
                                Candidate ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Info
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Contact
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Organization
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tr-xl">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                                        <span>Loading candidates...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCandidates.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No candidates found</p>
                                </td>
                            </tr>
                        ) : (

                            filteredCandidates.map((candidate) => {
                                return (
                                    <tr key={candidate.id} className={`hover:bg-gray-50 transition-colors ${candidate.isArchived ? 'opacity-75 bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                                        {candidate.customCandidateId || candidate.candidateId}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(candidate.customCandidateId || candidate.candidateId)}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <Copy className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                                {candidate.customCandidateId && (
                                                    <span className="text-xs text-gray-400">Sys: {candidate.candidateId}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {candidate.firstName} {candidate.lastName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {candidate.batch && <div className="inline-flex mr-2 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">Batch: {candidate.batch}</div>}
                                                {candidate.grade && <div className="inline-flex mr-2 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs">Gr: {candidate.grade}</div>}
                                                {candidate.department && <div className="block mt-1 text-xs text-gray-500">{candidate.department}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate max-w-[150px]" title={candidate.email}>{candidate.email}</span>
                                                </div>
                                                {candidate.phoneNumber && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{candidate.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${candidate.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {candidate.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {candidate.isArchived && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium w-fit bg-red-100 text-red-700 flex items-center gap-1">
                                                        <Archive className="w-3 h-3" /> Archived
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {candidate.organization?.name || 'N/A'}
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
                                                            setActionMenuOpen(actionMenuOpen?.id === candidate.id ? null : { id: candidate.id, position });
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${actionMenuOpen?.id === candidate.id ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {actionMenuOpen?.id === candidate.id && (
                                                        <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in ${actionMenuOpen.position === 'up' ? 'bottom-full mb-1 slide-in-from-bottom-2' : 'top-full mt-1 slide-in-from-top-2'
                                                            }`}>
                                                            <div className="p-2 border-b border-gray-50 flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuOpen(null);
                                                                        handleEdit(candidate);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <Edit className="w-4 h-4" /> Edit Details
                                                                </button>
                                                            </div>
                                                            <div className="p-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuOpen(null);
                                                                        handleArchiveToggle(candidate);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    {candidate.isArchived ? <Undo className="w-4 h-4 text-green-600" /> : <Archive className="w-4 h-4 text-amber-600" />}
                                                                    {candidate.isArchived ? 'Unarchive' : 'Archive'}
                                                                </button>
                                                                <div className="my-1 border-t border-gray-100" />
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuOpen(null);
                                                                        handleDeleteClick(candidate.id);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete Candidate
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Overlay to close when clicking outside */}
                                                    {actionMenuOpen?.id === candidate.id && (
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

            {/* Create Candidate Modal */}
            <AnimatePresence>
                {
                    showCreateModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, firstName: e.target.value })
                                                }
                                                required
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, lastName: e.target.value })
                                                }
                                                required
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Login ID *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.candidateId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, candidateId: e.target.value })
                                            }
                                            disabled={isEditing}
                                            required
                                            placeholder="Enter Login ID (e.g. 2024-001)"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Academic Info */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Batch
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.batch}
                                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                                placeholder="2025-A"
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Grade
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.grade}
                                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                                placeholder="10"
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Dept
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                placeholder="Sci"
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Contact Info
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={formData.phoneNumber}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phoneNumber: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {((!isEditing && !selectedOrgId) || (user?.role === 'EXAMINER' && !isEditing)) && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Assign Organization *
                                            </label>
                                            <select
                                                value={formData.organizationId || selectedOrgId}
                                                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                                                required
                                                disabled={user?.role === 'EXAMINER'}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                                            >
                                                <option value="">Select an organization...</option>
                                                {organizations.map((org) => (
                                                    <option key={org.id} value={org.id}>
                                                        {org.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                                        >
                                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                            {isEditing ? 'Update Candidate' : 'Create Candidate'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {
                    showDeleteModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                            >
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Candidate?</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this candidate? This action cannot be undone and will remove all their exam results.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

        </div >
    );
};

export default Candidates;
