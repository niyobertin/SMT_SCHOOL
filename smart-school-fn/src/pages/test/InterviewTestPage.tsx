import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Loader2 } from "lucide-react";
import { InterviewQuestion } from "../../components/test/InterviewQuestion";
import { startTest } from "../../redux/features/test/testSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
import { BackButton } from "../../components/common/BackButton";

export function InterviewTestPage() {
    const { testId } = useParams<{ testId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { test, questions, loading, error } = useSelector(
        (state: RootState) => state.test
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (testId) {
            setCurrentQuestionIndex(0);
            dispatch(startTest(testId));
        }
    }, [dispatch, testId]);

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Error Loading Interview Questions
                    </h2>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Loading Interview Questions
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please wait while the questions are loading...
                    </p>
                </div>
            </div>
        );
    }

    if (questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        return (
            <InterviewQuestion
                question={currentQuestion}
                totalQuestions={questions.length}
                currentQuestion={currentQuestionIndex + 1}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
                isFirstQuestion={currentQuestionIndex === 0}
                testTitle={test.data?.title || "Interview Preparation"}
            />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>No interview questions available.</p>
        </div>
    );
}
