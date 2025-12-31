import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchAllCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
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
    Search,
    Copy,
    Upload,
    Loader2
} from 'lucide-react';

const Candidates = () => {
    const dispatch = useAppDispatch();
    const { candidates, organizations, loading } = useAppSelector(
        (state) => state.examAdmin
    );

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        organizationId: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    useEffect(() => {
        const fetchParams: any = {
            organizationId: selectedOrgId || undefined,
            search: searchTerm || undefined,
        };
        dispatch(fetchAllCandidates(fetchParams));

    }, [selectedOrgId, searchTerm, dispatch]);

    const handleEdit = (candidate: any) => {
        setFormData({
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phoneNumber: candidate.phoneNumber || '',
            organizationId: candidate.organizationId || '',
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
            };
            dispatch(fetchAllCandidates(fetchParams));
        } catch (error: any) {
            toast.error(error || `Failed to ${isEditing ? 'update' : 'create'} candidate`);
        }
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', organizationId: '' });
        setIsEditing(false);
        setSelectedCandidate(null);
    };

    const downloadTemplate = () => {
        const template = [
            { FirstName: 'John', LastName: 'Doe', Email: 'john@example.com', PhoneNumber: '1234567890' },
            { FirstName: 'Jane', LastName: 'Smith', Email: '', PhoneNumber: '0987654321' },
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

                // Expected columns: FirstName, LastName, Email, PhoneNumber
                const formattedCandidates = data.map((row: any) => ({
                    firstName: row.FirstName || row.firstName || '',
                    lastName: row.LastName || row.lastName || '',
                    email: row.Email || row.email || '',
                    phoneNumber: row.PhoneNumber || row.phoneNumber || '',
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
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search candidates..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

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

                <div className="flex gap-2">
                    <input
                        type="file"
                        id="candidate-excel-upload"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                    />
                    <button
                        onClick={downloadTemplate}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium whitespace-nowrap"
                    >
                        Template
                    </button>
                    <button
                        onClick={() => document.getElementById('candidate-excel-upload')?.click()}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-medium whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Add Candidate
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Candidate ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Name
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
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
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
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No candidates found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                                {candidate.candidateId}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(candidate.candidateId)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            </button>
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
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{candidate.email}</span>
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
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {candidate.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 font-medium">
                                            {candidate.organization?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(candidate)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit Candidate"
                                            >
                                                <Edit className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(candidate.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Candidate"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Candidate Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, firstName: e.target.value })
                                            }
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, lastName: e.target.value })
                                            }
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {!isEditing && !selectedOrgId && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Organization *
                                        </label>
                                        <select
                                            value={formData.organizationId}
                                            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phoneNumber: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

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
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
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
                )}
            </AnimatePresence>

        </div>
    );
};

export default Candidates;
