import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TestInstructions } from '../../components/test/TestInstructions';
import { startTest, submitTestAttempt, submitAnswer, startTestAttempt } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';
import { BackButton } from '../../components/common/BackButton';

const QUESTION_TIME_LIMIT = 60; // 60 seconds per question

export function PsychometricTestPage() {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { test, questions, loading, error } = useSelector((state: RootState) => state.test);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [testStarted, setTestStarted] = useState(false);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef<any | null>(null);
    const attemptIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (testId) {
            setCurrentQuestionIndex(0);
            setAnswers({});
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
            handleNext();
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

    const handleNext = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const selectedAnswer = answers[currentQuestion?.id];

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Save answer if one was selected
        if (selectedAnswer && attemptIdRef.current) {
            try {
                await dispatch(submitAnswer({
                    attemptId: attemptIdRef.current,
                    questionId: currentQuestion.id,
                    answerText: '', // Psychometric usually just selects options, but we can pass empty string or handling depends on backend
                    selectedOptions: [selectedAnswer] // Assuming answerId is the selected option ID
                })).unwrap();
            } catch (error) {
                console.error('Failed to save answer:', error);
            }
        }

        // Move to next question or submit
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
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

    const handleAnswerSelect = (questionId: string, answerId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = async () => {
        if (!attemptIdRef.current || !testId) return;

        setIsSubmitting(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            await dispatch(submitTestAttempt(attemptIdRef.current));
            navigate(`/test/${testId}/results`);
        } catch (err) {
            console.error('Failed to submit test:', err);
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-5xl w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Exam</h2>
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
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <BackButton className="mb-4" />
                    </div>
                    <TestInstructions
                        test={{
                            title: test.data.title,
                            description: test.data.description,
                            instructions: test.data.instructions || [
                                'Each question has a 60-second time limit.',
                                'The test will automatically advance to the next question when time expires.',
                                'You cannot go back to previous questions.',
                                'Make sure to answer before time runs out.'
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-5xl w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Exam</h2>
                    <p className="text-gray-600 mb-6">Please wait while the exam is loading...</p>
                </div>
            </div>
        );
    }

    if (testStarted && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const selectedAnswer = answers[currentQuestion?.id];

        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                {/* Fixed Header */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Psychometric Session</h1>
                                <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Timer */}
                                <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time Remaining</div>
                                        <div className={`text-lg sm:text-xl font-black tabular-nums ${questionTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                                            {questionTimeLeft}s
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

                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {currentQuestion.question}
                            </h2>
                        </div>

                        {currentQuestion.image && (
                            <div className="mb-6">
                                <img
                                    src={currentQuestion.image}
                                    alt="Question"
                                    className="max-w-full h-auto rounded-lg border border-gray-200"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            {currentQuestion.options
                                ?.slice()
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                .map((option: any, index: number) => {
                                    const letter = String.fromCharCode(65 + index);
                                    const isSelected = selectedAnswer === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                ? "bg-blue-50 border-blue-500"
                                                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                }`}
                                        >
                                            <div className="flex items-center h-6">
                                                <input
                                                    id={`option-${option.id}`}
                                                    type="radio"
                                                    name="question-option"
                                                    value={option.id}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                            </div>
                                            <label
                                                htmlFor={`option-${option.id}`}
                                                className="ml-3 flex-1 cursor-pointer"
                                            >
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded mr-3">
                                                    {letter}
                                                </span>
                                                <span className="text-sm text-gray-800">
                                                    {option.option?.option?.option ?? option.text ?? option.option ?? "No label"}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{currentQuestionIndex + 1} / {questions.length}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden hidden">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {currentQuestionIndex === questions.length - 1 ? 'SUBMIT TEST' : 'NEXT QUESTION'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>No test content available.</p>
        </div>
    );
}
