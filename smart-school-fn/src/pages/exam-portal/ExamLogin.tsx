import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { candidateLogin } from '../../redux/features/examPortalSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowLeft } from 'lucide-react';

const ExamLogin = () => {
    const [candidateId, setCandidateId] = useState('');
    const [examCode, setExamCode] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.examPortal);

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
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden">
            {/* Background depth effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-20">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                </Link>
            </div>

            <div className="relative w-full max-w-[420px] z-10">
                {/* Overlapping Avatar */}
                <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
                    <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                        <User className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white pt-16 pb-14 px-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl text-gray-500 font-light tracking-wide italic">
                            Portal Login
                        </h2>
                        <p className="text-xs text-gray-400 mt-2 italic">Candidate Access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 bg-red-50 border border-red-100 rounded-sm text-center"
                                >
                                    <p className="text-[10px] text-red-600 font-medium">
                                        {error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <input
                                id="candidateId"
                                type="text"
                                value={candidateId}
                                onChange={(e) => setCandidateId(e.target.value.toUpperCase())}
                                placeholder="Candidate ID"
                                className="w-full bg-[#eeeeee] py-3 px-4 text-center text-gray-700 focus:outline-none transition-all placeholder:text-gray-400 placeholder:italic"
                                disabled={loading}
                            />

                            <input
                                id="examCode"
                                type="text"
                                value={examCode}
                                onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                placeholder="Exam Code"
                                className="w-full bg-[#eeeeee] py-3 px-4 text-center text-gray-700 focus:outline-none transition-all placeholder:text-gray-400 placeholder:italic"
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-3 text-lg font-medium transition-colors shadow-md rounded-[2px]"
                            >
                                {loading ? "Verifying..." : "Login"}
                            </button>
                        </div>

                        <div className="text-center mt-10">
                            <p className="text-[13px] text-gray-500 font-light">
                                Having trouble?{" "}
                                <Link
                                    to="/contact-us"
                                    className="text-gray-600 hover:text-gray-800 transition-colors italic"
                                >
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>

                {/* Secure Notice */}
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-medium text-white/80 uppercase tracking-widest">Secure Portal</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamLogin;
