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
    onPrevious: () => void;
    isLastQuestion: boolean;
    timeRemaining: number;
    onSubmit: () => void;
    testAttemptId?: string;
    openEndedResponse: string;
    onOpenEndedChange: (text: string) => void;
    testTitle?: string;
}

export function OpenEndedTestQuestion({
    testTitle,
    question,
    totalQuestions,
    currentQuestion,
    onNext,
    onPrevious,
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
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Fixed Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                {testTitle || "Examination Session"}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                                Question {currentQuestion} of {totalQuestions}
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Timer */}
                            <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time Remaining</div>
                                    <div className={`text-lg sm:text-xl font-black tabular-nums ${timeRemaining <= 60 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                                        {formatTime(timeRemaining)}
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
                            <span>{currentQuestion} / {totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                            <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                            />
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
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base font-medium text-gray-700 leading-relaxed shadow-sm"
                                rows={12}
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
            <div className="bg-white border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={onPrevious}
                                disabled={currentQuestion === 1}
                                className={`px-6 py-3 text-sm font-black rounded-xl transition-all border-2 active:scale-[0.98] ${currentQuestion === 1
                                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                                    }`}
                            >
                                PREVIOUS
                            </button>

                            <button
                                onClick={isLastQuestion ? handleSubmitTest : handleNext}
                                disabled={!isValid || isSubmitting}
                                className={`px-8 py-3 text-sm font-black text-white rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${!isValid || isSubmitting
                                    ? "bg-blue-200 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        SAVING...
                                    </>
                                ) : isLastQuestion ? (
                                    <>
                                        <Send size={18} />
                                        REVIEW ANSWERS
                                    </>
                                ) : (
                                    <>
                                        NEXT QUESTION
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                            Saved automatically
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
