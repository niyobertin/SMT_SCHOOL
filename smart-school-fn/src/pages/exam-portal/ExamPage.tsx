import { useEffect, useState, useCallback } from 'react';
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
    AlertTriangle
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

    // Start exam on component mount
    useEffect(() => {
        if (exam && !attempt) {
            dispatch(startExam(exam.id));
        }
    }, [exam, attempt, dispatch]);

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
        if (currentQuestion.type === 'MULTIPLE_CHOICE') {
            setSelectedOptions([optionId]);
        } else if (currentQuestion.type === 'TRUE_FALSE') {
            setSelectedOptions([optionId]);
        }
    };

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

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
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
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-8"
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
                                currentQuestion.options.map((option: any) => (
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
                        className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex gap-3">
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={goToNextQuestion}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowSubmitConfirm(true)}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                                Submit Exam
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
