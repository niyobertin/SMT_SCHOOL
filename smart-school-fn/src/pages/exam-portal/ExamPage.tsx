import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    startExam,
    submitAnswer,
    submitExam,
    setCurrentQuestion,
    saveAnswer,
    updateTimeRemaining,
} from '../../redux/features/examPortalSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    Circle,
    ChevronLeft,
    ChevronRight,
    Send,
    AlertTriangle,
    Info,
    ShieldCheck,
    AlertCircle,
    Loader2,
    FileText
} from 'lucide-react';
import ExamTimer from './ExamTimer';


const ExamPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {
        exam,
        attempt,
        questions,
        currentQuestionIndex,
        answers,
        timeRemaining,
        loading,
    } = useAppSelector((state) => state.examPortal);

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [answerText, setAnswerText] = useState('');
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    // We no longer auto-start. The user clicks "Start Exam" on the instructions page.

    // Load saved answer when question changes
    useEffect(() => {
        if (currentQuestion) {
            const saved = answers[currentQuestion.id];
            if (saved) {
                setSelectedOptions(saved.selectedOptions || []);
                setAnswerText(saved.answerText || '');
            } else {
                setSelectedOptions([]);
                setAnswerText('');
            }
        }
    }, [currentQuestion, answers]);

    const handleOptionSelect = (optionId: string) => {
        if (currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE') {
            setSelectedOptions([optionId]);
        }
    };

    // Shuffle options for the current question
    const shuffledOptions = useMemo(() => {
        if (!currentQuestion?.options) return [];
        // True/False usually don't need shuffling but the user asked to mix options
        // For True/False, we might want to keep the order, but let's follow "mix options" literally or apply only to multiple choice.
        // I'll apply to both but keep simple.
        return [...currentQuestion.options].sort(() => {
            // Use question id + candidate id if available for stable shuffle per session, 
            // but simple random is fine if we use useMemo with question.id as dependency.
            return Math.random() - 0.5;
        });
    }, [currentQuestion?.id]);

    const handleSaveAnswer = useCallback(async () => {
        if (!attempt || !currentQuestion) return;

        const answerData = {
            selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
            answerText: answerText.trim() || undefined,
        };

        // Save locally
        dispatch(saveAnswer({ questionId: currentQuestion.id, answer: answerData }));

        // Submit to backend
        try {
            await dispatch(
                submitAnswer({
                    attemptId: attempt.attemptId,
                    questionId: currentQuestion.id,
                    ...answerData,
                })
            ).unwrap();
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    }, [attempt, currentQuestion, selectedOptions, answerText, dispatch]);

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            handleSaveAnswer();
            dispatch(setCurrentQuestion(currentQuestionIndex + 1));
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            handleSaveAnswer();
            dispatch(setCurrentQuestion(currentQuestionIndex - 1));
        }
    };

    const handleSubmitExam = async () => {
        if (!attempt) return;

        // Save current answer first
        await handleSaveAnswer();

        try {
            const result = await dispatch(submitExam(attempt.attemptId)).unwrap();
            toast.success('Exam submitted successfully!');
            navigate('/exam-portal/result');
        } catch (error: any) {
            toast.error(error || 'Failed to submit exam');
        }
    };

    const handleTimeUp = () => {
        toast.warning('Time is up! Submitting exam automatically...');
        handleSubmitExam();
    };

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading examination details...</p>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl w-full bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100"
                >
                    <div className="p-6 text-center border-b border-gray-50 bg-gray-50/30">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">Official Examination Portal</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{exam.title}</h2>
                        <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">{exam.description || 'Please review the examination parameters and instructions carefully before initiating the session.'}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Duration</h4>
                                <p className="text-xl font-black text-blue-900">{exam.duration}m</p>
                            </div>
                            <div className="p-3 bg-green-50/50 rounded-2xl border border-green-100/50 text-center">
                                <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Passing Mark</h4>
                                <p className="text-xl font-black text-green-900">{exam.passingScore}%</p>
                            </div>
                            <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 text-center">
                                <FileText className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Total Questions</h4>
                                <p className="text-xl font-black text-purple-900">{exam._count?.questions || 'Multiple'}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                Core Instructions
                            </h3>
                            <ul className="space-y-2.5">
                                {exam.instructions && exam.instructions.length > 0 ? (
                                    exam.instructions.map((inst: string, idx: number) => (
                                        <li key={idx} className="flex gap-3 text-xs text-gray-600 font-medium leading-relaxed">
                                            <span className="flex-shrink-0 w-4 h-4 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-[9px] font-black mt-0.5">
                                                {idx + 1}
                                            </span>
                                            {inst}
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li className="flex gap-3 text-xs text-gray-600 font-medium leading-relaxed">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                            Ensure you have a stable internet connection.
                                        </li>
                                        <li className="flex gap-3 text-xs text-gray-600 font-medium leading-relaxed">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                            Once started, the timer cannot be paused.
                                        </li>
                                        <li className="flex gap-3 text-xs text-gray-600 font-medium leading-relaxed">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                            Answers are saved automatically as you progress.
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="p-3 bg-yellow-50/50 border border-yellow-100/50 rounded-xl flex gap-3 mb-6">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-yellow-800 leading-relaxed font-medium">
                                <strong>Secure Mode:</strong> Avoid refreshing or leaving this page. Unauthorized navigation may result in immediate submission.
                            </p>
                        </div>

                        <button
                            onClick={() => dispatch(startExam(exam.id))}
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Start Test
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Preparing your exam questions...</p>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{exam?.title}</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                        </div>

                        {attempt?.exam?.duration && (
                            <ExamTimer
                                initialTime={timeRemaining || 0}
                                onTimeUp={handleTimeUp}
                            />
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{answeredCount} Answered</span>
                            <span>{questions.length - answeredCount} Remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-blue-600 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Question Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
                        >
                            {/* Question */}
                            <div className="mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                        {currentQuestionIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                                            {currentQuestion.question}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                                        </p>
                                    </div>
                                </div>

                                {currentQuestion.image && (
                                    <img
                                        src={currentQuestion.image}
                                        alt="Question"
                                        className="w-full max-w-2xl rounded-lg shadow-md mt-4"
                                    />
                                )}
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE' ? (
                                    shuffledOptions.map((option: any) => (
                                        <motion.button
                                            key={option.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleOptionSelect(option.id)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedOptions.includes(option.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    {selectedOptions.includes(option.id) ? (
                                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                                    ) : (
                                                        <Circle className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="text-gray-800 font-medium">{option.option}</span>
                                            </div>
                                        </motion.button>
                                    ))
                                ) : (
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        placeholder="Type your answer here..."
                                        rows={6}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={goToNextQuestion}
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSubmitConfirm(true)}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg"
                                >
                                    <Send className="w-5 h-5" />
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-32">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">All questions</h3>
                            <p className="text-sm text-gray-500 mt-1">{answeredCount}/{questions.length} answered</p>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-4 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id];
                                const isCurrent = idx === currentQuestionIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            handleSaveAnswer();
                                            dispatch(setCurrentQuestion(idx));
                                        }}
                                        className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${isCurrent
                                            ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-600 text-white shadow-md'
                                            : isAnswered
                                                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                <span>Current</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm"></div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded-sm"></div>
                                <span>Not Answered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Examination?</h3>
                            <p className="text-gray-600 mb-6">
                                You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
                                <br />
                                Are you sure you want to submit?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitConfirm(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                >
                                    Review Answers
                                </button>
                                <button
                                    onClick={handleSubmitExam}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200"
                                >
                                    Yes, Submit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;
