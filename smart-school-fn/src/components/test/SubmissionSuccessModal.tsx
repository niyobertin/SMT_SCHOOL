import { CheckCircle, X } from 'lucide-react';

interface SubmissionSuccessModalProps {
    isOpen: boolean;
    testTitle: string;
    testType: 'INTERVIEW' | 'OPENENDED';
    onClose: () => void;
    onRetake?: () => void;
    canRetake?: boolean;
}

export function SubmissionSuccessModal({
    isOpen,
    testTitle,
    testType,
    onClose,
    onRetake,
    canRetake = false,
}: SubmissionSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Success Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-4">
                            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Test Submitted Successfully!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {testTitle}
                    </p>

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 text-left border border-blue-100">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Response Received</h3>
                                <p className="text-sm text-gray-700">
                                    Your {testType.toLowerCase()} test has been submitted and will be reviewed by your instructor.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">What's Next?</h3>
                                <p className="text-sm text-gray-700">
                                    You'll receive a notification once your test has been graded.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {canRetake && onRetake && (
                            <button
                                onClick={onRetake}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                            >
                                Retake Test
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`${canRetake ? 'flex-1' : 'w-full'} px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
