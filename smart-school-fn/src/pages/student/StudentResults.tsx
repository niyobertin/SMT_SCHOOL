import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, BookOpen, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import Skeleton from "react-loading-skeleton";

interface TestAttempt {
    id: string;
    score: number | null;
    totalQuestions: number;
    correctAnswers: number;
    status: string;
    isPassed: boolean;
    timeSpent: number | null;
    startTime: string;
    endTime: string | null;
    test: {
        id: string;
        title: string;
        passingScore: number;
        course: {
            title: string;
        };
    };
}

export const StudentResults = () => {
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem("accessToken_student");
                if (!token) return;
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/student-auth/results`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAttempts(data.data || []);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const passed = attempts.filter((a) => a.isPassed).length;
    const failed = attempts.filter((a) => !a.isPassed && a.status === "COMPLETED").length;

    if (loading) {
        return (
            <div className="space-y-4 p-2">
                <Skeleton height={80} borderRadius={16} count={4} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Results</h1>
                    <p className="text-gray-500 text-sm mt-1">Your test history and performance records.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Attempts</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{attempts.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passed</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{passed}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Failed</p>
                    <p className="text-3xl font-black text-rose-500 mt-1">{failed}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pass Rate</p>
                    <p className="text-3xl font-black text-[#1a7ea5] mt-1">
                        {attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Results List */}
            {error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-sm text-red-600 font-medium">{error}</div>
            ) : attempts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <Trophy className="mx-auto mb-3 text-slate-300" size={48} />
                    <p className="text-slate-500 font-medium">No test results yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Complete a test to see your results here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {attempts.map((attempt, idx) => (
                            <motion.div
                                key={attempt.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <button
                                    className="w-full text-left px-6 py-4 flex items-center gap-4"
                                    onClick={() => setExpandedId(expandedId === attempt.id ? null : attempt.id)}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${attempt.isPassed ? "bg-emerald-50 text-emerald-600" : attempt.status === "COMPLETED" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"}`}>
                                        {attempt.isPassed ? <CheckCircle2 size={20} /> : attempt.status === "COMPLETED" ? <XCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{attempt.test.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <BookOpen size={12} className="text-slate-400" />
                                            <span className="text-xs text-slate-400 truncate">{attempt.test.course?.title}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 mr-3">
                                        <p className={`text-2xl font-black ${attempt.isPassed ? "text-emerald-600" : "text-rose-500"}`}>
                                            {attempt.score !== null ? `${Math.round(attempt.score)}%` : "—"}
                                        </p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${attempt.isPassed ? "text-emerald-500" : attempt.status === "COMPLETED" ? "text-rose-400" : "text-amber-500"}`}>
                                            {attempt.isPassed ? "Passed" : attempt.status === "COMPLETED" ? "Failed" : attempt.status}
                                        </p>
                                    </div>
                                    {expandedId === attempt.id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                                </button>

                                <AnimatePresence>
                                    {expandedId === attempt.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-50 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
                                        >
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Score</p>
                                                <p className="font-bold text-slate-800 mt-0.5">{attempt.score !== null ? `${Math.round(attempt.score)}%` : "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Correct</p>
                                                <p className="font-bold text-slate-800 mt-0.5">{attempt.correctAnswers} / {attempt.totalQuestions}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Passing Score</p>
                                                <p className="font-bold text-slate-800 mt-0.5">{attempt.test.passingScore}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Date</p>
                                                <p className="font-bold text-slate-800 mt-0.5">{new Date(attempt.startTime).toLocaleDateString()}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};
