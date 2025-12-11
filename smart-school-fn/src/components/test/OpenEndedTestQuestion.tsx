import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { submitAnswer } from "../../redux/features/test/testSlice";
import type { AppDispatch } from "../../redux/stores";
import { Loader2, FileText, Send } from "lucide-react";

interface OpenEndedTestQuestionProps {
    question: {
        id: string;
        question: string;
        image?: string;
        type: string;
        points: number;
    };
    totalQuestions: number;
    currentQuestion: number;
    onNext: () => void;
    isLastQuestion: boolean;
    timeRemaining: number;
    onSubmit: () => void;
    testAttemptId?: string;
    openEndedResponse: string;
    onOpenEndedChange: (text: string) => void;
}

export function OpenEndedTestQuestion({
    question,
    totalQuestions,
    currentQuestion,
    onNext,
    isLastQuestion,
    timeRemaining,
    onSubmit,
    testAttemptId,
    openEndedResponse,
    onOpenEndedChange,
}: OpenEndedTestQuestionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const MIN_CHARS = 50;
    const MAX_CHARS = 5000;

    // Scroll to top when component mounts or question changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestion]);

    const charCount = openEndedResponse.length;
    const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

    const handleNext = async () => {
        if (!isValid) return;

        if (testAttemptId) {
            setIsSubmitting(true);
            try {
                await dispatch(
                    submitAnswer({
                        attemptId: testAttemptId,
                        questionId: question.id,
                        selectedOptions: [],
                        answerText: openEndedResponse,
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
        if (!isValid) return;

        if (testAttemptId) {
            try {
                await dispatch(
                    submitAnswer({
                        attemptId: testAttemptId,
                        questionId: question.id,
                        selectedOptions: [],
                        answerText: openEndedResponse,
                    })
                ).unwrap();
                onSubmit();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Failed to submit test:", error.message);
                } else {
                    console.error("An unknown error occurred while submitting the test");
                }
            }
        } else {
            onSubmit();
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Fixed Header */}
            <div className="border-b border-gray-200 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-4">
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                Question {currentQuestion} of {totalQuestions}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Timer */}
                            {timeRemaining > 0 && (
                                <div className="flex items-center space-x-2">
                                    <div className="flex gap-2">
                                        <div className="text-sm text-gray-600">Time Left :</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatTime(timeRemaining)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1">
                <div className="max-w-5xl mx-auto px-4 py-3">
                    {/* Question Card */}
                    <div className="rounded-lg mb-3">
                        {/* Question Header */}
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="text-blue-600" size={20} />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {currentQuestion}. {question.question}
                                </h2>
                            </div>
                        </div>

                        {/* Question Image */}
                        {question.image && (
                            <div className="mb-3">
                                <img
                                    src={question.image}
                                    alt="Question"
                                    className="max-w-xs h-auto block rounded-lg border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answer Section */}
                    <div className="rounded-lg">
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Response
                            </label>
                            <textarea
                                value={openEndedResponse}
                                onChange={(e) => onOpenEndedChange(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                rows={10}
                                placeholder="Type your detailed response here... (minimum 50 characters)"
                                maxLength={MAX_CHARS}
                            />
                        </div>

                        {/* Character Count */}
                        <div className="flex justify-between items-center text-xs">
                            <span className={charCount < MIN_CHARS ? "text-red-600" : "text-green-600"}>
                                {charCount < MIN_CHARS
                                    ? `${MIN_CHARS - charCount} more characters needed`
                                    : `✓ Minimum requirement met`}
                            </span>
                            <span className="text-gray-500">
                                {charCount} / {MAX_CHARS}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Footer Navigation */}
            <div className="bg-white">
                <div className="max-w-5xl mx-auto px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                            Question {currentQuestion} of {totalQuestions}
                        </div>
                        <button
                            onClick={isLastQuestion ? handleSubmitTest : handleNext}
                            disabled={!isValid || isSubmitting}
                            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md ${!isValid || isSubmitting
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Saving...
                                </>
                            ) : isLastQuestion ? (
                                <>
                                    <Send size={16} />
                                    Review Answers
                                </>
                            ) : (
                                <>
                                    Next Question
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
