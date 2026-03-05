import { useState, useRef, useEffect } from 'react';
import { useDebounce } from "use-debounce";
import {
    Calendar, ChevronLeft, ChevronRight, Plus,
    Eye, Edit, Trash2, X, Upload, Send, AlertCircle,
    Globe, Building2, FileText, Link, MoreVertical,
} from 'lucide-react';
import api from '../../redux/api/api';
import { Toast } from 'primereact/toast';
import TipTapEditor from '../../components/common/TipTapEditor';
import { CategoryModal } from '../Modals/CategoryModal';

interface JobFormData {
    title: string;
    description: string;
    dueDate: string;
    jobCategoryId: string;
    companyname: string;
    companyLogo: File | null;
    attachments: File | null;
    companywebsite: string;
    applicationLink: string;
}

export const JobBoard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const jobsPerPage = 10;
    const toast = useRef<Toast>(null);

    // Add editing state
    const [isEditing, setIsEditing] = useState(false);
    const [slug, setSlug] = useState(null);
    const [categories, setCategories] = useState<any[]>([]);

    // Add these states inside your Jobs component
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{ slug?: string; name: string } | null>(null);
    const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleEditCategory = (category: any) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDeleteCategory = async (category: any) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await api.delete(`/job-categories/category/${category?.slug}`);
                fetchCategories();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category deleted successfully',
                    life: 3000
                });
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete category',
                    life: 3000
                });
            }
        }
        setOpenMenuId(null);
    };

    // Add these functions inside your Jobs component
    const handleOpenCategoryModal = (category = null) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleCategorySubmit = async (data: { name: string }) => {
        try {
            setIsSubmittingCategory(true);
            if (selectedCategory) {
                console.log("selectedCategory", selectedCategory);
                // Update existing category
                await api.patch(`/job-categories/category/${selectedCategory.slug}`, data);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category updated successfully',
                    life: 3000,
                });
            } else {
                // Create new category
                await api.post('/job-categories/category', data);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category created successfully',
                    life: 3000,
                });
            }
            fetchCategories(); // Refresh the categories list
        } catch (error) {
            console.error('Error saving category:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save category. Please try again.',
                life: 3000,
            });
        } finally {
            setIsSubmittingCategory(false);
        }
    };
    // Create Job Form State
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        dueDate: '',
        jobCategoryId: '',
        companyname: '',
        companyLogo: null,
        attachments: null,
        companywebsite: '',
        applicationLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Fetch jobs from API
    const fetchJobs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: jobsPerPage.toString(),
                ...(searchTerm ? { q: searchTerm } : {}),
            }).toString();
            const response = await api.get(`/job-posts?${query}`);
            setJobs(response.data.data);
            setPagination({
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages
            });
        } catch (err: any) {
            console.error('Error fetching jobs:', err);
            setError(err.message || 'Failed to load jobs. Please try again later.');
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load jobs. Please try again later.',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/job-categories');
            setCategories(response.data.data);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to load categories. Please try again later.');
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load categories. Please try again later.',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [currentPage, debouncedSearch]);

    // Handle job deletion
    const handleDeleteJob = async (slug: string) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                await api.delete(`/job-posts/${slug}`);
                await fetchJobs();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Job deleted successfully',
                    life: 3000
                });
            } catch (err: any) {
                console.error('Error deleting job:', err);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete job. Please try again.',
                    life: 3000
                });
            }
        }
        setShowActionMenu(null);
    };

    // Handle opening edit modal
    const handleEditJob = (job: any) => {
        setIsEditing(true);
        setSlug(job.slug);

        // Format date for datetime-local input
        const formattedDate = new Date(job.dueDate).toISOString().slice(0, 16);

        setFormData({
            title: job.title || '',
            description: job.description || '',
            dueDate: formattedDate,
            jobCategoryId: job.jobCategoryId || '',
            companyname: job.companyname || '',
            companyLogo: null,
            attachments: job.attachments || '',
            companywebsite: job.companywebsite || '',
            applicationLink: job.applicationLink || ''
        });

        // Set logo preview if exists
        if (job.companylogo) {
            setLogoPreview(job.companylogo);
        } else {
            setLogoPreview(null);
        }

        setShowCreateModal(true);
        setShowActionMenu(null);
    };

    // Form handling functions
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'File size must be less than 5MB',
                    life: 3000
                });
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                companyLogo: file,
                companyLogoPreview: previewUrl,
            }));
            setLogoPreview(previewUrl);
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            companyLogo: null
        }));
        setLogoPreview(null);

        const fileInput = document.getElementById('companyLogo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('dueDate', new Date(formData.dueDate).toISOString());
            formDataToSend.append('companyname', formData.companyname);
            formDataToSend.append('jobCategoryId', formData.jobCategoryId);

            if (formData.companyLogo && formData.companyLogo instanceof File) {
                formDataToSend.append("companyLogo", formData.companyLogo);
            }

            if (formData.companywebsite) {
                formDataToSend.append('companywebsite', formData.companywebsite);
            }

            if (formData.applicationLink) {
                formDataToSend.append('applicationLink', formData.applicationLink);
            }

            if (formData.attachments && formData.attachments instanceof File) {
                formDataToSend.append('attachments', formData.attachments);
            }

            let response;
            if (isEditing && slug) {
                // Update existing job
                response = await api.patch(`/job-posts/${slug}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Create new job
                response = await api.post('/job-posts', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.status === 200 || response.status === 201) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEditing ? 'Job updated successfully' : 'Job created successfully',
                    life: 3000
                });

                // Refresh the jobs list
                await fetchJobs();

                resetForm();
                setTimeout(() => {
                    setShowCreateModal(false);
                }, 1500);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to ${isEditing ? 'update' : 'create'} job post: ${response.data.message}`,
                    life: 3000
                });
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to ${isEditing ? 'update' : 'create'} job post: ${error.message}`,
                life: 3000
            });
            console.error(`Error ${isEditing ? 'updating' : 'creating'} job:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            jobCategoryId: '',
            companyname: '',
            companyLogo: null,
            attachments: null,
            companywebsite: '',
            applicationLink: ''
        });
        setLogoPreview(null);
        setIsEditing(false);
        setSlug(null);

        // Clear file input
        const fileInput = document.getElementById('companyLogo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleViewJob = (name: string) => {
        setSearchTerm(name);
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {

        return (
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm flex items-center gap-1.5 ${status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : status === 'Draft' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                <div className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                {status}
            </span>
        );
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        resetForm();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Career Board</h1>
                        <p className="text-slate-500 font-medium mt-3">Manage all job postings and applications</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                    >
                        <Plus size={16} />
                        New Job
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 p-6 mb-8">
                    <div className="flex justify-start gap-2 items-center mb-4 flex-wrap ">
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center relative ">
                                <button
                                    onClick={() => handleViewJob(category.name)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    {category.name} ({category.jobPosts.length})
                                </button>
                                <div className="relative ml-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === category.id ? null : category.id);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                    </button>

                                    {openMenuId === category.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-2 z-50 border border-slate-100">
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1">
                            <div className="relative">

                                <input
                                    type="text"
                                    placeholder="Search by job title or company..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all outline-none text-sm font-bold text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1a7ea5]/20 border-t-[#1a7ea5]"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-gray-600">{error}</p>
                                <button
                                    onClick={() => fetchJobs()}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-24 bg-slate-50/30 rounded-2xl m-6 border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active vacancies found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job: any) => (
                                    <div
                                        key={job.id}
                                        className="border border-slate-100 bg-white rounded-2xl p-5 hover:border-[#1a7ea5]/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Company Logo */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={job.companylogo || 'https://via.placeholder.com/60x60/e5e7eb/9ca3af?text=LOGO'}
                                                        alt={`${job.companyname} logo`}
                                                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                    />
                                                </div>

                                                {/* Job Details */}
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors line-clamp-2">
                                                            {job.title}
                                                        </h3>
                                                        {getStatusBadge(job.isActive ? 'Active' : 'Inactive')}
                                                    </div>

                                                    <div className="flex items-center text-[11px] text-slate-500 mb-3 space-x-5 flex-wrap font-bold uppercase tracking-widest">
                                                        <span className="text-[#1a7ea5] bg-[#1a7ea5]/5 px-2.5 py-1 rounded-lg">{job.companyname}</span>
                                                        {job.companywebsite && (
                                                            <a
                                                                href={job.companywebsite}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center hover:underline"
                                                            >
                                                                <Globe className="w-3.5 h-3.5 mr-1.5" />
                                                                Portal
                                                            </a>
                                                        )}

                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            Created: {new Date(job.createdAt).toLocaleDateString()}
                                                        </span>

                                                        <span className="flex items-center font-semibold">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            Deadline: {new Date(job.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {job.applicationLink && (
                                                            <a
                                                                href={job.applicationLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm flex items-center"
                                                            >
                                                                <Link className="w-4 h-4 mr-1" />
                                                                Apply Now
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowActionMenu(showActionMenu === job.id ? null : job.id)}
                                                    className="p-2.5 text-slate-400 hover:text-[#1a7ea5] bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {showActionMenu === job.id && (
                                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-10 overflow-hidden">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleViewJob(job.slug)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Eye className="w-4 h-4 mr-3" />
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditJob(job)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Edit className="w-4 h-4 mr-3" />
                                                                Edit Job
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteJob(job.slug)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-3" />
                                                                Delete Job
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && jobs.length > 0 && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {
                                        Math.min(pagination.page * pagination.limit, pagination.total)
                                    } of {pagination.total} results
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        // Show first page, last page, and pages around current page
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${pagination.page === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create/Edit Job Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-700/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-50">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {isEditing ? 'Edit Vacancy' : 'New Vacancy'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="space-y-8">
                                    {/* Job Details Section */}
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Position Detail
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Job Title */}
                                            <div>
                                                <label htmlFor="title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                                    Vacancy Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Senior Software Architect"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="category"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Category
                                                </label>

                                                <div className="flex items-center justify-between gap-2">
                                                    <select
                                                        id="category"
                                                        name="jobCategoryId"
                                                        value={formData.jobCategoryId}
                                                        onChange={handleInputChange}
                                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categories?.map((category: any) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenCategoryModal()}
                                                        className="px-5 py-2.5 bg-[#1a7ea5]/10 text-[#1a7ea5] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#1a7ea5] hover:text-white transition-all whitespace-nowrap"
                                                    >
                                                        + Category
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Job Description */}
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Job Description *
                                                </label>
                                                <TipTapEditor
                                                    content={formData.description}
                                                    onChange={(newContent: string) => {
                                                        setFormData((prev: any) => ({ ...prev, description: newContent }));
                                                    }}
                                                    placeholder="Write your job description here..."
                                                    minHeight="300px"
                                                />
                                            </div>

                                            {/* Due Date */}
                                            <div>
                                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Application Deadline *
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="datetime-local"
                                                        id="dueDate"
                                                        name="dueDate"
                                                        value={formData.dueDate}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 outline-none transition-all text-sm font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Information Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Building2 className="w-5 h-5 mr-2" />
                                            Company Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Company Name */}
                                            <div>
                                                <label htmlFor="companyname" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Company Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="companyname"
                                                    name="companyname"
                                                    value={formData.companyname}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Kilimo Trust"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                                                />
                                            </div>

                                            {/* Company Website */}
                                            <div>
                                                <label htmlFor="companywebsite" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Company Website
                                                </label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="url"
                                                        id="companywebsite"
                                                        name="companywebsite"
                                                        value={formData.companywebsite}
                                                        onChange={handleInputChange}
                                                        placeholder="https://www.company.com"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 outline-none transition-all text-sm font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Logo */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Logo
                                            </label>

                                            {!logoPreview ? (
                                                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#1a7ea5]/20 transition-all">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <div className="space-y-1">
                                                        <p className="text-gray-600 text-sm">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="companyLogo"
                                                        name="companyLogo"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Company logo preview"
                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Application Link */}
                                        <div className="mt-4">
                                            <label htmlFor="applicationLink" className="block text-sm font-medium text-gray-700 mb-2">
                                                Application Link
                                            </label>
                                            <div className="relative">
                                                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="url"
                                                    id="applicationLink"
                                                    name="applicationLink"
                                                    value={formData.applicationLink}
                                                    onChange={handleInputChange}
                                                    placeholder="https://www.company.com/apply"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 outline-none transition-all text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                        {/* Attachments */}
                                        <div className="mt-4">
                                            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                                                Attachments
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="application/pdf | doc | docx | txt | zip | rar | 7z"
                                                    id="attachments"
                                                    name="attachments"
                                                    onChange={handleFileChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1a7ea5]/5 outline-none transition-all text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {isEditing ? 'Updating...' : 'Creating...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    {isEditing ? 'Update Job Post' : 'Publish Job Post'}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Click outside to close action menu */}
                {showActionMenu && (
                    <div
                        className="fixed inset-0 z-5"
                        onClick={() => setShowActionMenu(null)}
                    />
                )}
            </div>
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleCategorySubmit}
                initialData={selectedCategory}
                isSubmitting={isSubmittingCategory}
            />

            <Toast ref={toast} position="top-right" />
        </div>
    );
};