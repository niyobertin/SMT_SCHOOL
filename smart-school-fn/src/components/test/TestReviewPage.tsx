import { ArrowLeft, Send } from 'lucide-react';

interface ReviewPageProps {
    testTitle: string;
    questions: Array<{
        id: string;
        question: string;
        image?: string;
        response: string;
    }>;
    onEdit: (questionIndex: number) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export function TestReviewPage({
    testTitle,
    questions,
    onEdit,
    onSubmit,
    onBack,
    isSubmitting,
}: ReviewPageProps) {
    const answeredCount = questions.filter(q => q.response && q.response.trim()).length;
    const unansweredCount = questions.length - answeredCount;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{testTitle}</h1>
                            <p className="text-sm text-gray-500">Review Your Answers</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Test
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                            <div className="text-sm text-gray-600">Total Questions</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                            <div className="text-sm text-gray-600">Answered</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">{unansweredCount}</div>
                            <div className="text-sm text-gray-600">Unanswered</div>
                        </div>
                    </div>
                    {unansweredCount > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                ⚠️ You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
                                You can still submit, but consider answering all questions.
                            </p>
                        </div>
                    )}
                </div>

                {/* Questions Review */}
                <div className="space-y-4">
                    {questions.map((q, index) => {
                        const hasResponse = q.response && q.response.trim();
                        return (
                            <div
                                key={q.id}
                                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${hasResponse ? 'border-green-200' : 'border-amber-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-semibold text-gray-900">
                                                Question {index + 1}
                                            </h3>
                                            {hasResponse ? (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                                    Answered
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                                    Not Answered
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-3">{q.question}</p>
                                        {q.image && (
                                            <img
                                                src={q.image}
                                                alt="Question"
                                                className="max-w-md rounded-lg border border-gray-200 mb-3"
                                            />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onEdit(index)}
                                        className="ml-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Response:</p>
                                    {hasResponse ? (
                                        <p className="text-gray-800 whitespace-pre-wrap">{q.response}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">No response provided</p>
                                    )}
                                    {hasResponse && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {q.response.length} characters
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Submit Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Ready to Submit?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Once submitted, your responses will be sent to the instructor for review.
                            </p>
                        </div>
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all shadow-md ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Test
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
