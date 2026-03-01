import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import api from '../../redux/api/api';
import {
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
} from '../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    Mail,
    Phone,
    X,
    Upload,
    Image as ImageIcon,
    MapPin,
    Hash,
    Loader2
} from 'lucide-react';

const Organizations = () => {
    const dispatch = useAppDispatch();
    const { organizations, loading } = useAppSelector((state) => state.examAdmin);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        schoolCode: '',
        location: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    // Clean up preview URL on unmount or change
    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleEdit = (org: any) => {
        setFormData({
            name: org.name,
            description: org.description || '',
            contactEmail: org.contactEmail,
            contactPhone: org.contactPhone || '',
            schoolCode: org.schoolCode || '',
            location: org.location || '',
        });
        setLogoPreview(org.logo || null);
        setLogoFile(null);
        setSelectedOrgId(org.id);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleDeleteClick = (orgId: string) => {
        setSelectedOrgId(orgId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedOrgId) return;
        try {
            await dispatch(deleteOrganization(selectedOrgId)).unwrap();
            toast.success('Organization deleted successfully');
            setShowDeleteModal(false);
            setSelectedOrgId(null);
        } catch (error: any) {
            toast.error(error || 'Failed to delete organization');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const uploadLogo = async (orgId: string) => {
        if (!logoFile) return;

        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
            // The backend endpoint is POST /exams/organizations/:id/logo
            // Verify the route in exam.routes.ts: router.post('/organizations/:id/logo', ...)
            await api.post(`/exams/organizations/${orgId}/logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error("Failed to upload logo", error);
            toast.warning('Organization saved but logo upload failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let orgId = selectedOrgId;

            if (isEditing && selectedOrgId) {
                await dispatch(updateOrganization({ id: selectedOrgId, data: formData })).unwrap();
                toast.success('Organization updated successfully!');
            } else {
                const resultAction = await dispatch(createOrganization(formData));
                if (createOrganization.fulfilled.match(resultAction)) {
                    orgId = resultAction.payload.data.id; // access the new ID
                    toast.success('Organization created successfully!');
                } else {
                    throw new Error('Failed to create');
                }
            }

            // Handle Logo Upload if file exists and we have an ID
            if (logoFile && orgId) {
                await uploadLogo(orgId);
            }

            setShowCreateModal(false);
            resetForm();
            dispatch(fetchOrganizations()); // Refresh to get updated logo URL
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} organization`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            contactEmail: '',
            contactPhone: '',
            schoolCode: '',
            location: '',
        });
        setLogoFile(null);
        setLogoPreview(null);
        setIsEditing(false);
        setSelectedOrgId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-600 mt-1">Manage institutions and companies</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Create Organization
                </button>
            </div>

            {/* Organizations Grid */}
            {loading && organizations.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : organizations.length === 0 ? (
                <div className="text-center py-20">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first organization to get started</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Create Organization
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map((org) => (
                        <motion.div
                            key={org.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-indigo-300 transition-all p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center border border-indigo-100">
                                    {org.logo ? (
                                        <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-indigo-600" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(org)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(org.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{org.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{org.description}</p>

                            <div className="space-y-2 text-sm">
                                {org.contactEmail && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{org.contactEmail}</span>
                                    </div>
                                )}
                                {org.contactPhone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{org.contactPhone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm text-gray-500">
                                <span>📝 Exams: {org._count?.exams || 0}</span>
                                <span>👥 Candidates: {org._count?.candidates || 0}</span>
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-gray-400">
                                {org.schoolCode && (
                                    <div className="flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        <span>Code: {org.schoolCode}</span>
                                    </div>
                                )}
                                {org.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{org.location}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Organization' : 'Create Organization'}
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-2">
                                {/* Logo Upload Section */}
                                <div className="flex justify-center mb-3">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-28 h-24 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500 mt-2 absolute transform translate-y-24">Click to upload logo</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Organization Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Tech University"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Brief description of the organization"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Contact Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        required
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="admin@organization.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="+250 788 000 000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        School Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.schoolCode}
                                        onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., SMS001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Kigali, Rwanda"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-3 py-1.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Organization' : 'Create Organization')}
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
                            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Organization?</h3>
                            <p className="text-gray-600 mb-4 px-2">
                                Are you sure you want to delete this organization? This action cannot be undone and will delete all associated candidates and exams.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-3 py-1.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={loading}
                                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Organizations;
