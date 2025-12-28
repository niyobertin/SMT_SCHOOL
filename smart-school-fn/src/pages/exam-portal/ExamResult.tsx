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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Result Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div
                        className={`p-8 text-center ${isPassed
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-block"
                        >
                            {isPassed ? (
                                <div className="w-24 h-24 bg-white rounded-full  flex items-center justify-center mx-auto">
                                    <Trophy className="w-12 h-12 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>
                            )}
                        </motion.div>

                        <h1 className="text-4xl font-bold text-white mt-4">
                            {isPassed ? 'Congratulations!' : 'Exam Completed'}
                        </h1>
                        <p className="text-white text-lg mt-2">
                            {isPassed
                                ? 'You have successfully passed the examination'
                                : 'Thank you for taking the examination'}
                        </p>
                    </div>

                    {/* Score Section */}
                    <div className="p-8">
                        {/* Main Score */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block"
                            >
                                <div className="relative w-48 h-48 mx-auto">
                                    {/* Circular Progress */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="#e5e7eb"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke={isPassed ? '#10b981' : '#ef4444'}
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 88}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                            animate={{
                                                strokeDashoffset: 2 * Math.PI * 88 * (1 - score / 100),
                                            }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-gray-900">
                                            {Math.round(score)}%
                                        </span>
                                        <span className="text-sm text-gray-600 mt-1">Your Score</span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                                <FileText className="w-5 h-5" />
                                <p className="text-lg">
                                    Passing Score: <strong>{passingScore}%</strong>
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 rounded-xl p-6 text-center border-2 border-blue-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                                <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
                            </div>

                            <div className="bg-green-50 rounded-xl p-6 text-center border-2 border-green-100">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                                <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-6 text-center border-2 border-purple-100">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {formatTime(timeSpent || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Exam Info */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="font-semibold text-gray-900 mb-2">Exam Information</h3>
                            <p className="text-gray-700">
                                <strong>Exam:</strong> {exam?.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                                Submitted at {new Date().toLocaleString()}
                            </p>
                        </div>

                        {/* Detailed Results (if available) */}
                        {details && details.length > 0 && (
                            <div className="border-t pt-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Question Review
                                </h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {details.map((detail: any, index: number) => (
                                        <div
                                            key={detail.questionId}
                                            className={`p-4 rounded-lg border-2 ${detail.isCorrect
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {detail.isCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 mb-2">
                                                        Question {index + 1}: {detail.question}
                                                    </p>
                                                    {detail.explanation && (
                                                        <p className="text-sm text-gray-600 italic">
                                                            {detail.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={handleLogout}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                Exit Portal
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
