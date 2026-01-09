import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { candidateLogin } from '../../redux/features/examPortalSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowLeft, Clock, Timer } from 'lucide-react';

const ExamLogin = () => {
    const [candidateId, setCandidateId] = useState('');
    const [examCode, setExamCode] = useState('');
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isWaiting, scheduledStartTime, exam } = useAppSelector((state) => state.examPortal);

    const [soundPlayed, setSoundPlayed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isWaiting && scheduledStartTime) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const start = new Date(scheduledStartTime).getTime();
                const distance = start - now;

                // Sound notification: 5 minutes before start (300,000 ms)
                if (distance <= 300000 && distance > 0 && !soundPlayed) {
                    // Modern professional notification sound
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
                    audio.loop = true;
                    audioRef.current = audio;
                    audio.play().catch(e => console.error("Auto-play blocked or sound failed:", e));
                    setSoundPlayed(true);

                    // Stop after 30 seconds
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                        }
                    }, 30000);
                }

                if (distance <= 0) {
                    clearInterval(timer);
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                    toast.info('The exam is starting now!');
                    navigate('/exam-portal/exam');
                    return;
                }

                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }, 1000);

            return () => {
                clearInterval(timer);
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            };
        }
    }, [isWaiting, scheduledStartTime, navigate, soundPlayed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!candidateId.trim() || !examCode.trim()) {
            toast.error('Please enter both Candidate ID and Exam Code');
            return;
        }

        try {
            const result = await dispatch(candidateLogin({ candidateId, examCode })).unwrap();

            if (result.status === 'success') {
                if (!result.data.isWaiting) {
                    toast.success('Login successful! Redirecting to exam...');
                    setTimeout(() => {
                        navigate('/exam-portal/exam');
                    }, 1000);
                } else {
                    toast.info('Login successful! Waiting for exam to start...');
                }
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
                <AnimatePresence mode="wait">
                    {!isWaiting ? (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative"
                        >
                            {/* Overlapping Avatar */}
                            <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
                                <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            {/* Login Card */}
                            <div className="bg-white pt-16 pb-14 px-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">
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
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waiting-room"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative"
                        >
                            {/* Overlapping Clock Icon */}
                            <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
                                >
                                    <Clock className="w-12 h-12 text-white" />
                                </motion.div>
                            </div>

                            {/* Waiting Card */}
                            <div className="bg-white pt-16 pb-14 px-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative text-center">
                                <div className="mb-8">
                                    <h2 className="text-2xl text-[#1a7ea5] font-light tracking-wide uppercase italic">
                                        Waiting Room
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-2 font-light">Exam will begin shortly</p>
                                </div>

                                <div className="bg-[#f8f8f8] p-6 rounded-sm mb-8 border-y border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 italic">Now Waiting For</p>
                                    <h3 className="text-xl text-gray-600 font-medium italic">{exam?.title}</h3>
                                </div>

                                {/* Countdown Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-10">
                                    {[
                                        { label: 'Days', value: timeLeft?.days },
                                        { label: 'Hours', value: timeLeft?.hours },
                                        { label: 'Mins', value: timeLeft?.minutes },
                                        { label: 'Secs', value: timeLeft?.seconds }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div className="w-full bg-[#eeeeee] py-3 rounded-sm">
                                                <span className="text-2xl font-light text-gray-500 tabular-nums">
                                                    {item.value !== undefined ? String(item.value).padStart(2, '0') : '--'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1 italic">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-3 text-gray-400 italic">
                                    <Timer className="w-4 h-4 animate-pulse text-[#1a7ea5]" />
                                    <span className="text-xs">Secure Examination Protocol Active</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
