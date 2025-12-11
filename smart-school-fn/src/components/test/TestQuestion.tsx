import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAnswer, submitTest } from "../../redux/features/test/testSlice";
import type { RootState, AppDispatch } from "../../redux/stores";
import { Loader2 } from "lucide-react";

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
  nextLoading?: boolean;
  allAnswers?: Record<string, string>;
  onQuestionNavigate?: (index: number) => void;
  questions?: any[];
  testTitle?: string;
}

export function TestQuestion({
  question,
  totalQuestions,
  currentQuestion,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  timeRemaining,
  onSubmit,
  testAttemptId,
  allAnswers = {},
  onQuestionNavigate,
  questions = [],
  isLastQuestion,
}: TestQuestionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isSubmittingAnswer } = useSelector(
    (state: RootState) => state.test
  );

  // Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

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
      try {
        await dispatch(
          submitAnswer({
            attemptId: testAttemptId,
            questionId: question.id,
            selectedOptions: [selectedAnswer],
            answerText: "",
          })
        ).unwrap();

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes.toString().padStart(2, "0")
      }:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => timeRemaining - 1, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Count answered questions
  const answeredCount = Object.keys(allAnswers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-xs text-gray-500">Remaining time</div>
                  <div className="text-sm font-semibold text-gray-900">{formatTime(timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Submitted time</div>
                  <div className="text-sm font-semibold text-gray-900">00:00:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Question Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {/* Question Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {currentQuestion}. {question.question}
              </h2>
            </div>

            {/* Question Image */}
            {question.image && (
              <div className="mb-6">
                <img
                  src={question.image}
                  alt="Question"
                  className="max-w-xs h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Answers:</h3>
              <div className="space-y-3">
                {question.options
                  .slice()
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .map((option: any, index: number) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = selectedAnswer === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => onAnswerSelect(option.id)}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                          ? "bg-green-50 border-green-500"
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
                            {option.option?.option?.option ?? option.text ?? "No label"}
                          </span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>


            {/* Navigation Buttons */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              {!isLastQuestion ? (
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswer || isSubmitting}
                  className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center justify-center min-w-[100px] ${!selectedAnswer || isSubmitting
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
              ) : (
                <button
                  onClick={handleSubmitTest}
                  disabled={!selectedAnswer || isSubmitting || isSubmittingAnswer}
                  className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center justify-center min-w-[140px] ${!selectedAnswer || isSubmitting || isSubmittingAnswer
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {isSubmitting || isSubmittingAnswer ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "FINISH EXAM"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">All questions</h3>
              <p className="text-xs text-gray-500">
                {answeredCount}/{totalQuestions}
              </p>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const questionNum = i + 1;
                const questionId = questions[i]?.id;
                const isAnswered = questionId && allAnswers[questionId];
                const isCurrent = questionNum === currentQuestion;

                return (
                  <button
                    key={questionNum}
                    onClick={() => onQuestionNavigate?.(i)}
                    className={`w-12 h-12 rounded-md text-sm font-semibold transition-all ${isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2"
                      : isAnswered
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {questionNum}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-gray-600">Not answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded ring-2 ring-blue-400"></div>
                <span className="text-gray-600">Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}