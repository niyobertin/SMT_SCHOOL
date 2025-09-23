import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../redux/api/api';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from "use-debounce";

export const JobListing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);
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



    const handleJobClick = (slug: string) => {
        console.log(`Navigating to job details for job ID: ${slug}`);
        navigate(`/job-listing/${slug}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
                    <p className="text-gray-600">Discover your next career opportunity</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by job title or company..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-4 mb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600">{error}</p>
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No jobs found matching your search criteria.</p>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => handleJobClick(job.slug)}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-green-300"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Company Logo */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={job.companylogo || 'https://via.placeholder.com/60x60/e5e7eb/9ca3af?text=LOGO'}
                                            alt={`${job.companyname} logo`}
                                            className="w-16 h-16 rounded-lg object-cover border"
                                        />
                                    </div>

                                    {/* Job Details */}
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                                            {job.title}
                                        </h3>

                                        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4 flex-wrap">
                                            <span className="font-medium text-green-600">{job.companyname}</span>
                                            <span className="flex items-center">
                                                <a
                                                    href={job.companywebsite}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    View on Website
                                                </a>
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Deadline: {new Date(job.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <a
                                                href={job.applicationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:underline text-sm flex items-center"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="mr-1">Apply Now</span>
                                                <Clock className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && !error && jobs.length > 0 && (
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border">
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
                                            ? 'bg-green-500 text-white'
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
                )}
            </div>
        </div>
    );
};
