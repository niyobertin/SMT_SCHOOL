import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/features/auth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn, Building2 } from 'lucide-react';

const ExamAdminLogin = () => {
    const [credentials, setCredentials] = useState({
        identifier: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await dispatch(loginUser(credentials)).unwrap();

            // Check if user has admin or instructor role
            const userRole = result.data.user.role;
            if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
                toast.success('Welcome to Exam Administration Portal!');
                navigate('/exam-admin/dashboard');
            } else {
                toast.error('Access denied. Admin or Instructor role required.');
                setLoading(false);
            }
        } catch (error: any) {
            toast.error(error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header Card */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-block p-4 bg-white rounded-full mb-4"
                    >
                        <Shield className="w-16 h-16 text-indigo-600" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2">Exam Administration</h1>
                    <p className="text-indigo-200">Secure Portal for Exam Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email or Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={credentials.identifier}
                                    onChange={(e) =>
                                        setCredentials({ ...credentials, identifier: e.target.value })
                                    }
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) =>
                                        setCredentials({ ...credentials, password: e.target.value })
                                    }
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    <span>Access Admin Portal</span>
                                </div>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            <span>For Administrators & Instructors Only</span>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 text-center"
                >
                    <p className="text-indigo-200 text-sm">
                        Need to take an exam?{' '}
                        <a
                            href="/exam-portal/login"
                            className="text-white font-semibold hover:underline"
                        >
                            Go to Candidate Portal
                        </a>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ExamAdminLogin;
