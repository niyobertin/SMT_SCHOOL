import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/features/auth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn, Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ExamAdminLogin = () => {
    const [credentials, setCredentials] = useState({
        identifier: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await dispatch(loginUser(credentials)).unwrap();

            // Check if user has admin or instructor role
            const userRole = result.data.user.role;
            if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR' || userRole === 'EXAMINER') {
                toast.success('Welcome to Exam Administration Portal!');
                navigate('/exam-admin/dashboard');
            } else {
                toast.error('Access denied. Admin, Instructor, or Examiner role required.');
                setLoading(false);
            }
        } catch (error: any) {
            toast.error(error || 'Login failed');
            setLoading(false);
        }
    };

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
                    <p className="text-gray-500 font-medium">Secure administrative access for instructors</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 p-10 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Administrator Credentials
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={credentials.identifier}
                                    onChange={(e) =>
                                        setCredentials({ ...credentials, identifier: e.target.value })
                                    }
                                    required
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300 outline-none"
                                    placeholder="Email or Username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Secret Access Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) =>
                                        setCredentials({ ...credentials, password: e.target.value })
                                    }
                                    required
                                    className="w-full pl-14 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300 outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-indigo-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 flex items-center justify-center gap-3 mt-10"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Access Management</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 rounded-full border border-indigo-100/50">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Administrative Restricted Zone</span>
                    </div>

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
