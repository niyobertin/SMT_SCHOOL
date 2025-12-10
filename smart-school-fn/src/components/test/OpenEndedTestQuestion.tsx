import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer } from "../../redux/features/test/testSlice";
import type { RootState, AppDispatch } from "../../redux/stores";
import { Loader2, FileText, Clock, Send } from "lucide-react";

interface OpenEndedTestQuestionProps {
    question: any;
    totalQuestions: number;
    currentQuestion: number;
    onNext: () => void;
    isLastQuestion: boolean;
    onSubmit: () => void;
    testAttemptId?: string;
    testTitle?: string;
    timeRemaining?: number;
    openEndedResponse: string;
    onOpenEndedChange: (text: string) => void;
}

export function OpenEndedTestQuestion({
    question,
    totalQuestions,
    currentQuestion,
    onNext,
    isLastQuestion,
    onSubmit,
    testAttemptId,
    testTitle = "Open-Ended Assessment",
    timeRemaining = 0,
    openEndedResponse,
    onOpenEndedChange,
}: OpenEndedTestQuestionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { loading: isSubmittingAnswer } = useSelector(
        (state: RootState) => state.test
    );

    const MIN_CHARS = 50;
    const MAX_CHARS = 5000;
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
                        answerText: "",
                        openEndedResponse: openEndedResponse,
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
                        answerText: "",
                        openEndedResponse: openEndedResponse,
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{testTitle}</h1>
                            <p className="text-sm text-gray-500">
                                Question {currentQuestion} of {totalQuestions}
                            </p>
                        </div>

                        <div className="flex items-center space-x-6">
                            {/* Timer */}
                            {timeRemaining > 0 && (
                                <div className="flex items-center space-x-2">
                                    <Clock size={18} className="text-gray-500" />
                                    <div>
                                        <div className="text-xs text-gray-500">Time Remaining</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatTime(timeRemaining)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Finish Button */}
                            <button
                                onClick={handleSubmitTest}
                                disabled={isSubmitting || isSubmittingAnswer || !isValid}
                                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || isSubmittingAnswer ? "Submitting..." : "FINISH EXAM"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    {/* Question Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="text-orange-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Question {currentQuestion}
                            </h2>
                        </div>
                        <p className="text-base text-gray-700 leading-relaxed">
                            {question.question}
                        </p>
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

                    {/* Response Area */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Your Response *
                            </label>
                            <span
                                className={`text-sm font-medium ${charCount < MIN_CHARS
                                        ? "text-red-600"
                                        : charCount > MAX_CHARS
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }`}
                            >
                                {charCount} / {MAX_CHARS} characters
                                {charCount < MIN_CHARS && ` (minimum ${MIN_CHARS})`}
                            </span>
                        </div>
                        <textarea
                            value={openEndedResponse}
                            onChange={(e) => onOpenEndedChange(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            rows={15}
                            placeholder="Type your detailed response here... (minimum 50 characters)"
                            maxLength={MAX_CHARS}
                        />
                        {charCount < MIN_CHARS && (
                            <p className="text-sm text-red-600 mt-2">
                                Please write at least {MIN_CHARS - charCount} more characters.
                            </p>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">
                            Instructions:
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Provide a detailed and thoughtful response</li>
                            <li>Your response will be reviewed by the instructor</li>
                            <li>Minimum {MIN_CHARS} characters required</li>
                            <li>You can edit your response before moving to the next question</li>
                        </ul>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Progress: {currentQuestion} / {totalQuestions}
                        </div>
                        <button
                            onClick={isLastQuestion ? handleSubmitTest : handleNext}
                            disabled={!isValid || isSubmitting}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-md transition-colors ${!isValid || isSubmitting
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-orange-600 hover:bg-orange-700"
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : isLastQuestion ? (
                                <>
                                    <Send size={18} />
                                    Submit Test
                                </>
                            ) : (
                                <>
                                    Next Question
                                    <svg
                                        className="w-5 h-5"
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
