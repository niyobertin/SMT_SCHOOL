import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer, submitTest } from "../../redux/features/test/testSlice";
import type { RootState, AppDispatch } from "../../redux/stores";

// interface Question {
//   id: string;
//   question: string;
//   type: string;
//   points: number;
//   options: Array<{
//     id: string;
//     option: any;
//     order: number;
//   }>;
//   order: number;
// }

interface TestQuestionProps {
  question: any;
  totalQuestions: number;
  currentQuestion: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastQuestion: boolean;
  timeRemaining: number;
  onSubmit: () => void;
  testAttemptId?: string;
}

export function TestQuestion({
  question,
  totalQuestions,
  currentQuestion,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  isLastQuestion,
  timeRemaining,
  onSubmit,
  testAttemptId,
}: TestQuestionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isSubmittingAnswer } = useSelector(
    (state: RootState) => state.test
  );

  const handleNext = async () => {
    if (!selectedAnswer) return;

    if (testAttemptId) {
      setIsSubmitting(true);
      try {
        await dispatch(
          submitAnswer({
            attemptId: testAttemptId,
            questionId: question.id,
            selectedOptions: [selectedAnswer],
            answerText: "",
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
    if (testAttemptId && selectedAnswer) {
      // Submit the current answer first
      try {
        await dispatch(
          submitAnswer({
            attemptId: testAttemptId,
            questionId: question.id,
            selectedOptions: [selectedAnswer],
            answerText: "",
          })
        ).unwrap();

        // Then submit the test
        await dispatch(submitTest(testAttemptId)).unwrap();
        onSubmit();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to submit test:", error.message);
        } else {
          console.error("An unknown error occurred while submitting the test");
        }
      }
    } else if (testAttemptId) {
      // If no answer selected but we have an attempt ID, just submit the test
      try {
        await dispatch(submitTest(testAttemptId)).unwrap();
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

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Update timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => timeRemaining - 1, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-gray-500">
          Question {currentQuestion} of {totalQuestions}
        </div>
        <div className="text-sm font-medium text-gray-700">
          Time remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
        </h2>

        <div className="space-y-3 mt-6">
          {question.options
            .slice()
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((option: any) => (
              <div key={option.id} className="flex items-center">
                <input
                  id={`option-${option.id}`}
                  type="radio"
                  name="question-option"
                  value={option.id}
                  checked={selectedAnswer === option.id}
                  onChange={() => onAnswerSelect(option.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`option-${option.id}`}
                  className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option.option?.option?.option ?? "No label"}
                </label>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onPrevious}
          disabled={currentQuestion === 1}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            currentQuestion === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitTest}
            disabled={isSubmitting || isSubmittingAnswer}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting || isSubmittingAnswer
              ? "Submitting..."
              : "Submit Test"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedAnswer || isSubmitting || isSubmittingAnswer}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !selectedAnswer || isSubmitting || isSubmittingAnswer
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {isSubmitting || isSubmittingAnswer ? "Saving..." : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
