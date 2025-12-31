import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/features/examPortalSlice';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    Trophy,
    FileText,
    Home,
    LogOut,
} from 'lucide-react';

const ExamResult = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { result, exam } = useAppSelector((state) => state.examPortal);

    useEffect(() => {
        if (!result) {
            navigate('/exam-portal/login');
        }
    }, [result, navigate]);

    if (!result) {
        return null;
    }

    const {
        score,
        isPassed,
        passingScore,
        totalQuestions,
        correctAnswers,
        timeSpent,
        details,
    } = result;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/exam-portal/login');
    };

    return (
        <div className="min-h-screen bg-white py-6 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Result Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-8 text-center border-b border-gray-50 bg-gray-50/20">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-block"
                        >
                            {isPassed ? (
                                <div className="w-16 h-16 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center mx-auto shadow-sm">
                                    <Trophy className="w-8 h-8 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center mx-auto shadow-sm">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                            )}
                        </motion.div>

                        <div className="mt-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3 ${isPassed ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                <div className={`w-1 h-1 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                    {isPassed ? 'Assessment Qualified' : 'Assessment Completed'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {isPassed ? 'Congratulations!' : 'Session Summary'}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                                {isPassed
                                    ? 'You have successfully achieved the required proficiency level.'
                                    : 'Your examination results have been recorded for final review.'}
                            </p>
                        </div>
                    </div>

                    {/* Score Section */}
                    <div className="p-6">
                        {/* Main Score & Passing Mark Row */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block"
                            >
                                <div className="relative w-32 h-32 mx-auto">
                                    {/* Circular Progress */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="#f1f5f9"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke={isPassed ? '#10b981' : '#ef4444'}
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 58}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                                            animate={{
                                                strokeDashoffset: 2 * Math.PI * 58 * (1 - score / 100),
                                            }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-gray-900">
                                            {score.toFixed(1)}%
                                        </span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Final Score</span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="flex flex-col items-center md:items-start gap-4">
                                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pass Mark Threshold</p>
                                        <p className="text-lg font-black text-gray-900 leading-none">{passingScore}%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status Result</p>
                                        <p className={`text-lg font-black leading-none ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPassed ? 'SUCCESS' : 'DISSATISFIED'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-blue-50/50 rounded-xl p-3 text-center border border-blue-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Questions</p>
                                <p className="text-xl font-black text-blue-600 leading-none">{totalQuestions}</p>
                            </div>

                            <div className="bg-green-50/50 rounded-xl p-3 text-center border border-green-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Correct</p>
                                <p className="text-xl font-black text-green-600 leading-none">{correctAnswers}</p>
                            </div>

                            <div className="bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Duration</p>
                                <p className="text-xl font-black text-purple-600 leading-none">
                                    {formatTime(timeSpent || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Exam Info */}
                        <div className="bg-gray-50/50 rounded-xl p-4 mb-6 border border-gray-100/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Identification</h3>
                                <p className="text-xs font-bold text-gray-700 leading-none">{exam?.title}</p>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium">
                                Submitted {new Date().toLocaleTimeString()}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleLogout}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-black text-xs rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-100 uppercase tracking-widest"
                            >
                                <LogOut className="w-4 h-4" />
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 p-4 bg-white rounded-lg shadow text-center"
                >
                    <p className="text-sm text-gray-600">
                        Your results have been recorded. Please contact your administrator for further information.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default ExamResult;
