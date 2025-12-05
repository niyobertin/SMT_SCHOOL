import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer } from "../../redux/features/test/testSlice";
import type { RootState, AppDispatch } from "../../redux/stores";
import { Loader2, Clock } from "lucide-react";

interface PsychometricTestQuestionProps {
    question: any;
    totalQuestions: number;
    currentQuestion: number;
    selectedAnswer: string | null;
    onAnswerSelect: (answerId: string) => void;
    onNext: () => void;
    isLastQuestion: boolean;
    onSubmit: () => void;
    testAttemptId?: string;
    testTitle?: string;
    openEndedResponse?: string;
    onOpenEndedChange?: (text: string) => void;
}

export function PsychometricTestQuestion({
    question,
    totalQuestions,
    currentQuestion,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    isLastQuestion,
    onSubmit,
    testAttemptId,
    testTitle = "Psychometric Test",
    openEndedResponse = "",
    onOpenEndedChange,
}: PsychometricTestQuestionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(question.timePerQuestion || 30);
    const [questionStartTime] = useState(Date.now());
    const dispatch = useDispatch<AppDispatch>();
    const { loading: isSubmittingAnswer } = useSelector(
        (state: RootState) => state.test
    );
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev: number) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Auto-advance when time expires
            handleAutoAdvance();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeLeft]);

    // Reset timer when question changes
    useEffect(() => {
        setTimeLeft(question.timePerQuestion || 30);
    }, [question.id, question.timePerQuestion]);

    const handleAutoAdvance = async () => {
        if (isSubmitting) return;

        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        if (testAttemptId) {
            setIsSubmitting(true);
            try {
                await dispatch(
                    submitAnswer({
                        attemptId: testAttemptId,
                        questionId: question.id,
                        selectedOptions: selectedAnswer ? [selectedAnswer] : [],
                        answerText: "",
                        openEndedResponse: openEndedResponse || "",
                        questionTimeSpent: timeSpent,
                    })
                ).unwrap();

                if (isLastQuestion) {
                    onSubmit();
                } else {
                    onNext();
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Failed to save answer:", error.message);
                } else {
                    console.error("An unknown error occurred while saving the answer");
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            if (isLastQuestion) {
                onSubmit();
            } else {
                onNext();
            }
        }
    };

    const handleNext = async () => {
        if (isSubmitting) return;

        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        if (testAttemptId) {
            setIsSubmitting(true);
            try {
                await dispatch(
                    submitAnswer({
                        attemptId: testAttemptId,
                        questionId: question.id,
                        selectedOptions: selectedAnswer ? [selectedAnswer] : [],
                        answerText: "",
                        openEndedResponse: openEndedResponse || "",
                        questionTimeSpent: timeSpent,
                    })
                ).unwrap();
                onNext();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Failed to save answer:", error.message);
                } else {
                    console.error("An unknown error occurred while saving the answer");
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            onNext();
        }
    };

    const handleSubmitTest = async () => {
        if (isSubmitting) return;

        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        if (testAttemptId) {
            setIsSubmitting(true);
            try {
                await dispatch(
                    submitAnswer({
                        attemptId: testAttemptId,
                        questionId: question.id,
                        selectedOptions: selectedAnswer ? [selectedAnswer] : [],
                        answerText: "",
                        openEndedResponse: openEndedResponse || "",
                        questionTimeSpent: timeSpent,
                    })
                ).unwrap();
                onSubmit();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Failed to submit test:", error.message);
                } else {
                    console.error("An unknown error occurred while submitting the test");
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            onSubmit();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const getTimerColor = () => {
        if (timeLeft <= 10) return "text-red-600";
        if (timeLeft <= 20) return "text-orange-600";
        return "text-green-600";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{testTitle}</h1>
                            <p className="text-sm text-gray-500">
                                Question {currentQuestion} of {totalQuestions}
                            </p>
                        </div>

                        <div className="flex items-center space-x-6">
                            {/* Question Timer */}
                            <div className="flex items-center space-x-2">
                                <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                                <div>
                                    <div className="text-xs text-gray-500">Time Remaining</div>
                                    <div className={`text-lg font-bold ${getTimerColor()}`}>
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </div>

                            {/* Finish Exam Button */}
                            <button
                                onClick={handleSubmitTest}
                                disabled={isSubmitting || isSubmittingAnswer}
                                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || isSubmittingAnswer
                                    ? "Submitting..."
                                    : "FINISH EXAM"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Question Header */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Q{currentQuestion}. {question.question}
                            {question.points && (
                                <span className="ml-2 text-sm text-gray-500">
                                    /{question.points} Marks
                                </span>
                            )}
                        </h2>
                    </div>

                    {/* Question Image */}
                    {question.image && (
                        <div className="mb-6">
                            <img
                                src={question.image}
                                alt="Question"
                                className="max-w-full h-auto rounded-lg border border-gray-200"
                            />
                        </div>
                    )}

                    {/* Answer Options */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Answers:
                        </h3>
                        <div className="space-y-3">
                            {question.options
                                ?.slice()
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                .map((option: any, index: number) => {
                                    const letter = String.fromCharCode(65 + index);
                                    const isSelected = selectedAnswer === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => onAnswerSelect(option.id)}
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
                                                    onChange={() => onAnswerSelect(option.id)}
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
                                                    {option.option?.option?.option ??
                                                        option.text ??
                                                        "No label"}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Open-Ended Response */}
                    <div className="mb-6">
                        <label
                            htmlFor="open-ended"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Additional Comments (Optional):
                        </label>
                        <textarea
                            id="open-ended"
                            rows={4}
                            value={openEndedResponse}
                            onChange={(e) => onOpenEndedChange?.(e.target.value)}
                            placeholder="Provide any additional thoughts or explanations..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            {timeLeft <= 10 && (
                                <span className="text-red-600 font-semibold">
                                    ⚠️ Time running out! Question will auto-submit.
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting || timeLeft === 0}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center justify-center min-w-[100px] ${isSubmitting || timeLeft === 0
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "NEXT"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
