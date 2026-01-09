import { useState, useEffect } from 'react';
import { Calendar, Globe, ExternalLink, MapPin, Clock, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/api/api';
import { motion } from "framer-motion";

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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-slate-100 border-t-[#1a7ea5] rounded-full mx-auto mb-4"
                    />
                    <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">Loading career details</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md bg-white p-12 rounded-3xl shadow-xl border border-slate-100"
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Job Not Found</h2>
                    <p className="text-slate-500 mb-8 font-medium">{error || 'The position you are looking for may have been removed or is no longer active.'}</p>
                    <button
                        onClick={() => navigate('/job-listing')}
                        className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:bg-[#1a7ea5] transition-all shadow-lg"
                    >
                        Back to Listings
                    </button>
                </motion.div>
            </div>
        );
    }

    const isExpired = new Date(job.dueDate) < new Date();
    const daysRemaining = Math.ceil((new Date(job.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header / Hero Area */}
            <div className="bg-slate-50 pt-12 pb-24 border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/job-listing')}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.2em] text-[#1a7ea5] mb-12 hover:gap-4 transition-all"
                    >
                        <ArrowLeft size={16} /> Back to Job Listings
                    </motion.button>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-grow"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#6cb9cc]/10 text-[#1a7ea5] border border-[#6cb9cc]/20'
                                    }`}>
                                    {isExpired ? 'Expired' : 'Active Recruitment'}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[.1em]">
                                    Posted {formatDate(job.createdAt)}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-tight">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[12px] tracking-wide">
                                    <Building2 size={18} className="text-[#1a7ea5]" />
                                    {job.companyname}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[12px] tracking-wide">
                                    <MapPin size={18} className="text-[#1a7ea5]" />
                                    Rwanda
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-shrink-0"
                        >
                            <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                                <img
                                    src={job.companylogo || 'https://via.placeholder.com/120'}
                                    alt={job.companyname}
                                    className="w-24 h-24 object-cover rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-8 bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 p-8 md:p-12 overflow-hidden"
                    >
                        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 bg-slate-50 text-[#1a7ea5] rounded-lg flex items-center justify-center"><Clock size={18} /></span>
                            Description & Responsibilities
                        </h2>

                        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: job?.description || '' }} className="job-desc-content" />
                        </div>

                        {job?.attachments && (
                            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2">Attachments</h4>
                                <p className="text-slate-600 flex items-center gap-2 font-medium">
                                    <ExternalLink size={16} /> {job.attachments}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Application Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#1a7ea5] rounded-3xl p-8 text-white shadow-[0_30px_60px_rgba(26,126,165,0.3)]"
                        >
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Take Action</h3>
                            {!isExpired ? (
                                <>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="text-[#6cb9cc]" size={20} />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/60 font-black">Deadline</p>
                                                <p className="font-bold">{formatDate(job.dueDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="text-[#6cb9cc]" size={20} />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/60 font-black">Urgency</p>
                                                <p className="font-bold">{daysRemaining} days left</p>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={job.applicationLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-5 bg-white text-[#1a7ea5] text-center rounded-full font-black uppercase tracking-[.2em] text-[12px] shadow-2xl hover:bg-slate-50 transition-all hover:scale-[1.03] active:scale-[0.98]"
                                    >
                                        Apply Now
                                    </a>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                        <Clock className="text-white/40" size={32} />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-sm mb-2">Applications Closed</p>
                                    <p className="text-white/60 text-xs font-medium italic">This position is no longer accepting submissions.</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Company Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                        >
                            <h3 className="text-sm font-black uppercase tracking-[.1em] text-slate-900 mb-6">Corporate Portal</h3>
                            <a
                                href={job.companywebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-[#1a7ea5] transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <Globe className="text-[#1a7ea5]" size={20} />
                                    </div>
                                    <span className="text-[12px] font-black uppercase tracking-widest text-slate-600 group-hover:text-white">Official Website</span>
                                </div>
                                <ArrowLeft className="rotate-180 text-slate-300 group-hover:text-white" size={16} />
                            </a>

                            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Verification ID: <span className="text-slate-600">{job.id.slice(-12).toUpperCase()}</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
