import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { candidateLogin, clearError } from '../../redux/features/examPortalSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Key, LogIn, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center"
                        >
                            <LogIn className="w-10 h-10 text-blue-600" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Examination Portal</h1>
                        <p className="text-blue-100">Enter your credentials to begin</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Login Failed</p>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Candidate ID Input */}
                        <div className="mb-6">
                            <label htmlFor="candidateId" className="block text-sm font-semibold text-gray-700 mb-2">
                                Candidate ID / Student ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="candidateId"
                                    type="text"
                                    value={candidateId}
                                    onChange={(e) => setCandidateId(e.target.value.toUpperCase())}
                                    placeholder="CAND-XXXXXX"
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-mono"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Exam Code Input */}
                        <div className="mb-8">
                            <label htmlFor="examCode" className="block text-sm font-semibold text-gray-700 mb-2">
                                Exam Code (Key)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="examCode"
                                    type="text"
                                    value={examCode}
                                    onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                    placeholder="XXXX-XXXX"
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg font-mono"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    <span>Access Examination</span>
                                </div>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Need help? Contact your exam administrator
                        </p>
                    </div>
                </div>

                {/* Info Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                    <p className="text-sm text-blue-800 text-center">
                        <strong>Important:</strong> Ensure you have a stable internet connection before starting the exam
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ExamLogin;
