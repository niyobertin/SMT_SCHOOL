import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

interface InterviewQuestionProps {
    question: any;
    totalQuestions: number;
    currentQuestion: number;
    onNext: () => void;
    onPrevious: () => void;
    isLastQuestion: boolean;
    isFirstQuestion: boolean;
    testTitle?: string;
}

export function InterviewQuestion({
    question,
    totalQuestions,
    currentQuestion,
    onNext,
    onPrevious,
    isLastQuestion,
    isFirstQuestion,
    testTitle = "Interview Preparation",
}: InterviewQuestionProps) {
    const [showSolution, setShowSolution] = useState(false);

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

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">Practice Mode</span> - No time
                                limit
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Question Section */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Q{currentQuestion}. {question.question}
                            </h2>
                            <button
                                onClick={() => setShowSolution(!showSolution)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${showSolution
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                            >
                                {showSolution ? (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        <span>Hide Solution</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>Show Solution</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Question Image */}
                        {question.image && (
                            <div className="mb-4">
                                <img
                                    src={question.image}
                                    alt="Question"
                                    className="max-w-full h-auto rounded-lg border border-gray-200"
                                />
                            </div>
                        )}

                        {/* Question Options (if multiple choice) */}
                        {question.options && question.options.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Options:
                                </h3>
                                <div className="space-y-2">
                                    {question.options
                                        ?.slice()
                                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                        .map((option: any, index: number) => {
                                            const letter = String.fromCharCode(65 + index);
                                            return (
                                                <div
                                                    key={option.id}
                                                    className="flex items-start p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                                >
                                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-600 text-white text-xs font-bold rounded mr-3">
                                                        {letter}
                                                    </span>
                                                    <span className="text-sm text-gray-800">
                                                        {option.option?.option?.option ??
                                                            option.text ??
                                                            "No label"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Solution Section */}
                    {showSolution && (
                        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-green-900">
                                    Solution
                                </h3>
                            </div>

                            {/* Solution Text */}
                            {question.solution && (
                                <div className="mb-4">
                                    <p className="text-gray-800 whitespace-pre-wrap">
                                        {question.solution}
                                    </p>
                                </div>
                            )}

                            {/* Solution Image */}
                            {question.solutionImage && (
                                <div className="mt-4">
                                    <img
                                        src={question.solutionImage}
                                        alt="Solution"
                                        className="max-w-full h-auto rounded-lg border border-green-300"
                                    />
                                </div>
                            )}

                            {/* Correct Answer Highlight (for multiple choice) */}
                            {question.options && question.options.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                                        Correct Answer:
                                    </h4>
                                    {question.options
                                        .filter((opt: any) => opt.isCorrect)
                                        .map((option: any) => {
                                            const optIndex = question.options.findIndex(
                                                (o: any) => o.id === option.id
                                            );
                                            const letter = String.fromCharCode(65 + optIndex);
                                            return (
                                                <div
                                                    key={option.id}
                                                    className="flex items-start p-3 bg-green-100 border-2 border-green-400 rounded-lg"
                                                >
                                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-bold rounded mr-3">
                                                        {letter}
                                                    </span>
                                                    <span className="text-sm font-semibold text-green-900">
                                                        {option.option?.option?.option ??
                                                            option.text ??
                                                            "No label"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        Explanation:
                                    </h4>
                                    <p className="text-sm text-gray-700">
                                        {question.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                            onClick={onPrevious}
                            disabled={isFirstQuestion}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isFirstQuestion
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <div className="text-sm text-gray-500">
                            {currentQuestion} / {totalQuestions}
                        </div>

                        <button
                            onClick={onNext}
                            disabled={isLastQuestion}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isLastQuestion
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
