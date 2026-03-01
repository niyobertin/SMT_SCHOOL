import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn, Building2, ArrowLeft } from 'lucide-react';

const ExamAdminLogin = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md mb-8 relative z-10"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Back to Home</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-indigo-100 mx-auto mb-6 flex items-center justify-center border border-gray-50"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Examiner Portal</h1>
                    <p className="text-gray-500 font-medium">This login page is being deprecated</p>
                </div>

                {/* Deprecation Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 p-10 backdrop-blur-sm text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
                            <Building2 className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Notice: Unified Login</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            We've unified our login systems. Please use the primary login page for all administrative, instructor, and examiner access.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                    >
                        <span>Go to Primary Login</span>
                        <LogIn className="w-5 h-5" />
                    </Link>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 flex flex-col items-center gap-6"
                >
                    <p className="text-gray-400 text-sm font-medium">
                        Looking for the candidate portal?{' '}
                        <Link
                            to="/exam-portal/login"
                            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline decoration-indigo-200 underline-offset-4"
                        >
                            Switch to Candidate Login
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ExamAdminLogin;
