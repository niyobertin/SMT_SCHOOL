import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Loader2, Eye, EyeOff, FileText } from 'lucide-react';
import { TestInstructions } from '../../components/test/TestInstructions';
import { startTest, submitTestAttempt, submitAnswer, startTestAttempt } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';
import { BackButton } from '../../components/common/BackButton';
import { toast, ToastContainer } from 'react-toastify';

const QUESTION_TIME_LIMIT = 90; // 1.5 minutes per question


export function InterviewTestPage() {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { test, questions, loading, error } = useSelector(
        (state: RootState) => state.test
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [testStarted, setTestStarted] = useState(false);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [showSolution, setShowSolution] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef<any | null>(null);
    const attemptIdRef = useRef<string | null>(null);

    // Load answers from localStorage
    useEffect(() => {
        if (testId && testStarted) {
            const savedAnswers = localStorage.getItem(`interview_test_${testId}_answers`);
            if (savedAnswers) {
                setAnswers(JSON.parse(savedAnswers));
            }
        }
    }, [testId, testStarted]);

    // Save answers to localStorage
    useEffect(() => {
        if (testId && testStarted && Object.keys(answers).length > 0) {
            localStorage.setItem(`interview_test_${testId}_answers`, JSON.stringify(answers));
        }
    }, [answers, testId, testStarted]);

    useEffect(() => {
        if (testId) {
            setCurrentQuestionIndex(0);
            setTestStarted(false);
            dispatch(startTest(testId));
        }
    }, [dispatch, testId]);

    const handleStartTest = async () => {
        if (!testId) return;

        try {
            const result: any = await dispatch(startTestAttempt(testId)).unwrap();
            attemptIdRef.current = result.id;
            setTestStarted(true);
            setQuestionTimeLeft(QUESTION_TIME_LIMIT);
            startQuestionTimer();
        } catch (err) {
            console.error('Failed to start exam attempt:', err);
        }
    };

    // Auto-advance when time runs out
    useEffect(() => {
        if (questionTimeLeft === 0 && testStarted) {
            handleAutoAdvance();
        }
    }, [questionTimeLeft, testStarted]);

    const startQuestionTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setQuestionTimeLeft(QUESTION_TIME_LIMIT);

        timerRef.current = setInterval(() => {
            setQuestionTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAutoAdvance = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const answer = answers[currentQuestion?.id] || '';

        // Save answer
        if (attemptIdRef.current) {
            try {
                await dispatch(submitAnswer({
                    attemptId: attemptIdRef.current,
                    questionId: currentQuestion.id,
                    answerText: answer,
                    selectedOptions: []
                })).unwrap();
            } catch (error) {
                console.error('Failed to save answer:', error);
            }
        }

        // Move to next question or submit
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowSolution(false);
            startQuestionTimer();
        } else {
            handleSubmit();
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNavigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowSolution(false);
        startQuestionTimer();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Scroll to top when question changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestionIndex]);

    const handleSubmit = async () => {
        if (!attemptIdRef.current || !testId) return;

        setIsSubmitting(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            // Save all answers to database before submitting
            // This ensures the email will contain all questions and responses
            const savePromises = questions.map(async (question: any) => {
                const answer = answers[question.id] || '';
                if (answer.trim()) {
                    try {
                        await dispatch(submitAnswer({
                            attemptId: attemptIdRef.current!,
                            questionId: question.id,
                            answerText: answer,
                            selectedOptions: []
                        })).unwrap();
                    } catch (error) {
                        console.error(`Failed to save answer for question ${question.id}:`, error);
                    }
                }
            });

            // Wait for all answers to be saved
            await Promise.all(savePromises);

            // Now submit the test
            await dispatch(submitTestAttempt(attemptIdRef.current)).unwrap();

            // Clear localStorage after successful submission
            localStorage.removeItem(`interview_test_${testId}_answers`);
            setIsSubmitting(false);

            // Show success toast
            toast.success('Test submitted successfully! Your instructor will review your responses and provide feedback.');
            setTimeout(() => {
                navigate(-1);
            }, 3000);
        } catch (err) {
            console.error('Failed to submit test:', err);
            setIsSubmitting(false);
            toast.error('Failed to submit test. Please try again.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Exams</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex flex-col space-y-3">
                        <BackButton className="self-center" />
                        <button
                            onClick={() => testId && dispatch(startTest(testId))}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!testStarted && test?.data) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <BackButton className="mb-4" />
                    </div>
                    <TestInstructions
                        test={{
                            title: test.data.title,
                            description: test.data.description,
                            instructions: test.data.instructions || [
                                'Each question has a 1.5-minute time limit.',
                                'Maximum 5 minutes to respond to each question.',
                                'Type your answer in the text area provided.',
                                'You can view the model answer by clicking "View Answer".',
                                'Your answers are automatically saved.',
                                'The test will auto-advance when time expires.'
                            ],
                            duration: test.data.duration,
                            passingScore: test.data.passingScore
                        }}
                        onStart={handleStartTest}
                    />
                </div>
            </div>
        );
    }

    if (testStarted && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestion?.id] || '';

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

                {/* Question Navigation Sidebar */}
                <div className="w-full lg:w-72 bg-white border-b lg:border-r border-gray-200 p-4 sm:p-6 flex flex-col order-2 lg:order-1">
                    <h3 className="text-xs font-black text-gray-900 mb-4 uppercase tracking-[0.1em]">Navigation</h3>
                    <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-full no-scrollbar">
                        <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-5 gap-2 pb-4">
                            {questions.map((q: any, index: number) => {
                                const isAnswered = answers[q.id] && answers[q.id].trim().length > 0;
                                const isCurrent = index === currentQuestionIndex;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleNavigateToQuestion(index)}
                                        className={`w-7 h-7 rounded-lg transition-all border flex items-center justify-center text-[9px] font-black relative ${isCurrent
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-50'
                                            : isAnswered
                                                ? 'bg-green-50 border-green-100 text-green-800 hover:bg-green-100'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                                            }`}
                                    >
                                        {index + 1}
                                        {isAnswered && !isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress</span>
                            <span className="text-sm font-black text-blue-600">
                                {Object.keys(answers).filter(k => answers[k]?.trim()).length} / {questions.length}
                            </span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || isSubmitting}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading || isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'FINISH TEST'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col order-1 lg:order-2">
                    {/* Sticky Header */}
                    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                        <div className="px-4 py-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Interview Session</h1>
                                    <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Timer */}
                                    <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time Remaining</div>
                                            <div className={`text-lg sm:text-xl font-black tabular-nums ${questionTimeLeft <= 30 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                                                {formatTime(questionTimeLeft)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Secure Portal</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar Area */}
                            <div className="mt-6">
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <span>Progress</span>
                                    <span>{currentQuestionIndex + 1} / {questions.length}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                                    <div
                                        className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        <div className="max-w-5xl mx-auto">
                            {/* Question Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="text-purple-600" size={20} />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {currentQuestionIndex + 1}. {currentQuestion.question}
                                        </h2>
                                    </div>
                                </div>

                                {currentQuestion.image && (
                                    <div className="mb-3">
                                        <img
                                            src={currentQuestion.image}
                                            alt="Question"
                                            className="max-w-xs h-auto mx-auto block rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Answer Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
                                <div className="mb-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Response
                                    </label>
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                                        rows={8}
                                        placeholder="Type your response here..."
                                    />
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-xs font-bold text-gray-400">
                                            {currentAnswer.length} characters
                                        </div>
                                        <div className="text-[10px] text-gray-400 italic">
                                            Auto-saves as you type
                                        </div>
                                    </div>
                                </div>

                                {/* View Answer Button */}
                                {currentQuestion.explanation && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setShowSolution(!showSolution)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            {showSolution ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {showSolution ? 'Hide Answer' : 'View Answer'}
                                        </button>

                                        {showSolution && (
                                            <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 mb-2 text-sm">Model Answer:</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{currentQuestion.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>No test content available.</p>
        </div>
    );
}
