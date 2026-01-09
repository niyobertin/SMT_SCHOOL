import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, ArrowRight, Briefcase } from 'lucide-react';
import api from '../redux/api/api';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";

export const JobListing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 1
    });

    const jobsPerPage = 5;

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const query = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: jobsPerPage.toString(),
                    status: "active",
                    ...(searchTerm ? { q: searchTerm } : {}),
                }).toString();

                const response = await api.get(`/job-posts?${query}`);

                const jobData = response.data.data || [];
                setJobs(jobData);
                setPagination({
                    page: response.data.pagination?.page || 1,
                    limit: response.data.pagination?.limit || jobsPerPage,
                    total: response.data.pagination?.total || 0,
                    totalPages: response.data.pagination?.totalPages || 1
                });

            } catch (err: any) {
                console.error('Error fetching jobs:', err);
                setError(err.message || 'Failed to load jobs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [currentPage, jobsPerPage, debouncedSearch]);

    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/job-categories');
            setCategories(response.data.data);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleViewJob = (name: string) => {
        setSearchTerm(name);
        setCurrentPage(1);
    };

    const handleJobClick = (slug: string) => {
        navigate(`/job-listing/${slug}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Hero Header */}
            <div className="bg-slate-50 py-16 lg:py-24 border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a7ea5]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6cb9cc]/5 rounded-full -ml-48 -mb-48 blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-tight">
                            Job Opportunities
                        </h1>
                        <div className="w-16 h-1 bg-[#1a7ea5] mx-auto mb-8 rounded-full" />
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Discover your next career opportunity and join the workforce of the future.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-24">
                {/* Search & Filters Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-200 p-6 mb-12"
                >
                    <div className="flex flex-col gap-8">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by job title or keyword..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        {/* Category Tags */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSearchTerm('')}
                                className={`px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all ${!searchTerm
                                    ? 'bg-[#1a7ea5] text-white'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                            >
                                All Jobs
                            </button>
                            {categories?.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleViewJob(category.name)}
                                    className={`px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all ${searchTerm === category.name
                                        ? 'bg-[#1a7ea5] text-white'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                        }`}
                                >
                                    {category.name} <span className="ml-1 opacity-60">({category.jobPosts.length})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Job Listings Area */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-slate-100 border-t-[#1a7ea5] rounded-full"
                            />
                        </div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-50 p-12 rounded-3xl text-center border border-red-100"
                        >
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-red-900 mb-2">Oops! Something went wrong</h3>
                            <p className="text-red-600 mb-8 max-w-sm mx-auto">{error}</p>
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="px-10 py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-full hover:bg-red-700 transition-all"
                            >
                                Retry Now
                            </button>
                        </motion.div>
                    ) : jobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50 p-24 rounded-3xl text-center border border-dashed border-slate-200"
                        >
                            <Briefcase className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-slate-900 mb-2 uppercase tracking-tight">No Jobs Found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your search criteria or explore other categories.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {jobs.map((job, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={job.id}
                                    onClick={() => handleJobClick(job.slug)}
                                    className="group bg-white border border-slate-200 p-6 rounded-3xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row gap-6 items-center"
                                >
                                    {/* Company Logo - Cleaned up */}
                                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-slate-50">
                                        <img
                                            src={job.companylogo || 'https://via.placeholder.com/100?text=LOGO'}
                                            alt={job.companyname}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Job Details Content */}
                                    <div className="flex-grow text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1a7ea5] transition-colors tracking-tight">
                                                {job.title.charAt(0).toUpperCase() + job.title.slice(1).toLowerCase()}
                                            </h3>
                                            <span className="inline-block px-3 py-1 bg-[#6cb9cc]/10 text-[#1a7ea5] rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                                                Active
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-[13px] text-slate-500 font-medium">
                                            <span className="font-semibold text-[#1a7ea5] uppercase tracking-wider">{job.companyname}</span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                Posted {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-red-500 font-semibold bg-red-50 px-3 py-1 rounded-full uppercase text-[11px] tracking-widest">
                                                <Clock className="w-4 h-4" />
                                                Deadline: {new Date(job.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="flex items-center">
                                        <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-500">
                                            <ArrowRight size={24} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Pagination - Cleanized */}
                {!isLoading && !error && jobs.length > 0 && pagination.totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                        <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span> of {pagination.total} positions
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-[#1a7ea5] hover:text-[#1a7ea5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) pageNum = i + 1;
                                    else if (pagination.page <= 3) pageNum = i + 1;
                                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                    else pageNum = pagination.page - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[13px] font-bold transition-all ${pagination.page === pageNum
                                                ? 'bg-[#1a7ea5] text-white'
                                                : 'bg-white border border-slate-100 text-slate-400 hover:border-[#1a7ea5] hover:text-[#1a7ea5]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-[#1a7ea5] hover:text-[#1a7ea5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
