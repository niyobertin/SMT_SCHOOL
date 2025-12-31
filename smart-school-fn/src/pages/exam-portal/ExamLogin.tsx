import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { candidateLogin, clearError } from '../../redux/features/examPortalSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, LogIn, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const ExamLogin = () => {
    const [candidateId, setCandidateId] = useState('');
    const [examCode, setExamCode] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, exam } = useAppSelector((state) => state.examPortal);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!candidateId.trim() || !examCode.trim()) {
            toast.error('Please enter both Candidate ID and Exam Code');
            return;
        }

        try {
            const result = await dispatch(candidateLogin({ candidateId, examCode })).unwrap();

            if (result.status === 'success') {
                toast.success('Login successful! Redirecting to exam...');
                setTimeout(() => {
                    navigate('/exam-portal/exam');
                }, 1000);
            }
        } catch (err: any) {
            toast.error(err || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md mb-8 relative z-10"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Back to Home</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo/Icon Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-blue-100 mx-auto mb-6 flex items-center justify-center border border-gray-50"
                    >
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <LogIn className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Examination Portal</h1>
                    <p className="text-gray-500 font-medium">Verify your identity to begin the assessment</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 p-10 backdrop-blur-sm">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Login Failed</p>
                                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Candidate ID Input */}
                        <div>
                            <label htmlFor="candidateId" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Candidate Identifier
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="candidateId"
                                    type="text"
                                    value={candidateId}
                                    onChange={(e) => setCandidateId(e.target.value.toUpperCase())}
                                    placeholder="e.g. CAND-001234"
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300 outline-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Exam Code Input */}
                        <div>
                            <label htmlFor="examCode" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Secure Exam Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="examCode"
                                    type="text"
                                    value={examCode}
                                    onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. EXAM-ABCD"
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300 outline-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 flex items-center justify-center gap-3 mt-10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Access Assessment</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Secure Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 flex flex-col items-center gap-4"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-full border border-blue-100/50">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Secure Examination Protocol Active</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ExamLogin;
