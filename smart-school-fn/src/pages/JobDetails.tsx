import { useState, useEffect } from 'react';
import { Calendar, Globe, ExternalLink, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/api/api';

interface JobDetailsData {
    id: string;
    title: string;
    slug: string;
    description: string;
    dueDate: string;
    companyname: string;
    companylogo: string;
    companywebsite: string;
    applicationLink: string;
    attachments: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const JobDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!slug) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get(`/job-posts/${slug}`);
                if (response.data.status === 'success') {
                    setJob(response.data.data);
                } else {
                    throw new Error('Failed to load job details');
                }
            } catch (err: any) {
                console.error('Error fetching job details:', err);
                setError(err.message || 'Failed to load job details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobDetails();
    }, [slug]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Job</h2>
                    <p className="text-gray-600 mb-6">{error || 'The job you are looking for could not be found.'}</p>
                    <button
                        onClick={() => navigate('/job-listing')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Job Listings
                    </button>
                </div>
            </div>
        );
    }

    const isExpired = new Date(job.dueDate) < new Date();
    const daysRemaining = Math.ceil((new Date(job.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Job Details</h1>
                    <button
                        onClick={() => navigate('/job-listing')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Job Listings
                    </button>
                </div>
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={job.companylogo}
                                            alt={job.companyname}
                                            className="w-16 h-16 rounded-md object-cover border-2 border-white shadow-lg"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMTJDMTQuMjA5MSAxMiAxNiAxMC4yMDkxIDE2IDhDMTYgNS43OTA5IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwOSA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzMzMzIDE0IDcuNzY2NjcgMTUuNzY2NyA3IDE4VjIwSDE3VjE4QzE2LjIzMzMgMTUuNzY2NyAxNC42NjY3IDE0IDEyIDE0WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4KPC9zdmc+';
                                            }}
                                        />
                                        <div>
                                            <h2 className="text-xl font-semibold">{job.companyname}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Globe className="w-4 h-4" />
                                                <a
                                                    href={job.companywebsite}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-200 hover:text-white transition-colors duration-200 text-sm"
                                                >
                                                    {job.companywebsite.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                                        {job.title}
                                    </h1>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-medium ${isExpired
                                    ? 'bg-red-500 bg-opacity-20 text-red-100 border border-red-300'
                                    : 'bg-green-500 bg-opacity-20 text-green-100 border border-green-300'
                                    }`}>
                                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Description */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8 transform hover:shadow-xl transition-shadow duration-300">
                        <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: job?.description || '' }} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            {job?.attachments && (
                                <p>Attachemnt: {job?.attachments}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>Project Location</span>
                            </div>
                            <p className="text-gray-800 font-medium">
                                {/(?:musanze|nyabihu)\b/i.test(job.title)
                                    ? 'Musanze and Nyabihu Districts, Rwanda'
                                    : 'Various Locations, Rwanda'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Due Date Card */}
                        <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${isExpired ? 'border-red-500' : 'border-green-500'
                            } transform hover:shadow-xl transition-shadow duration-300`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-full ${isExpired ? 'bg-red-100' : 'bg-green-100'
                                    }`}>
                                    <Calendar className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-green-600'
                                        }`} />
                                </div>
                                <h4 className="font-semibold text-gray-800">Submission Deadline</h4>
                            </div>
                            <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {formatDate(job.dueDate)}
                            </p>
                            {!isExpired && (
                                <div className="mt-3 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                </div>
                            )}
                        </div>

                        {/* Application Button */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <a
                                href={job.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 ${isExpired
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                                    }`}
                                onClick={isExpired ? (e) => e.preventDefault() : undefined}
                            >
                                <ExternalLink className="w-5 h-5" />
                                {isExpired ? 'Application Closed' : 'Apply Now'}
                            </a>
                            {!isExpired && (
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Click to visit the application portal
                                </p>
                            )}
                        </div>

                        {/* Job Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h4 className="font-semibold text-gray-800 mb-4">Job Details</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Job ID:</span>
                                    <span className="font-medium text-gray-800 text-xs font-mono">
                                        {job.id.slice(-8)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Posted:</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(job.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${job.isActive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {job.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 text-center">
                    <p className="text-gray-600 text-sm">
                        For inquiries regarding this position, please contact {job.companyname} directly through their official website.
                    </p>
                    <div className="mt-4">
                        <a
                            href={job.companywebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Visit {job.companyname} Website
                            <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
