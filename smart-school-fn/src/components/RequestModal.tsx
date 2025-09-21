import { CreditCard, Crown, Lock, X } from "lucide-react";

export const LoginRequestModal = ({ isOpen, onClose, onContinue, featureName = "this feature" }: { isOpen: boolean, onClose: () => void, onContinue: () => void, featureName?: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Authorization Required</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <p className="text-gray-600 mb-6">
                        You need to be logged in to access <span className="font-semibold text-black">{featureName}</span>. Please sign in to continue or cancel to go back.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onContinue}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PaymentRequestModal = ({ isOpen, onClose, onGoToPricing }: { isOpen: boolean, onClose: () => void, onGoToPricing: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <CreditCard className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Payment Required</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        You need a premium subscription to access <strong>This course content</strong>.
                        Please upgrade your plan to continue or cancel to go back.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onGoToPricing}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center"
                        >
                            <Crown className="w-4 h-4 mr-1" />
                            View Pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};