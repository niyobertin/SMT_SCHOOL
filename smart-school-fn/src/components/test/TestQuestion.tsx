import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface TestQuestionProps {
  testTitle?: string;
  question: any;
  totalQuestions: number;
  currentQuestion: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  onPrevious: () => void;
  isLastQuestion: boolean;
  timeRemaining: number;
  testAttemptId?: string;
  allAnswers?: Record<string, string>;
  onQuestionNavigate?: (index: number) => void;
  questions?: any[];
  handleNext: () => void | Promise<void>;
  handleSubmitTest: () => void | Promise<void>;
  isSubmitting: boolean;
  isSubmittingAnswer: boolean;
}

export function TestQuestion({
  testTitle,
  question,
  totalQuestions,
  currentQuestion,
  selectedAnswer,
  onAnswerSelect,
  onPrevious,
  isLastQuestion,
  timeRemaining,
  allAnswers = {},
  onQuestionNavigate,
  questions = [],
  handleNext,
  handleSubmitTest,
  isSubmitting,
  isSubmittingAnswer,
}: TestQuestionProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes.toString().padStart(2, "0")
      }:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(allAnswers).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                {testTitle || "Examination Session"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 font-bold uppercase tracking-widest mt-1">
                Question {currentQuestion} of {totalQuestions}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center space-x-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                <div>
                  <div className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time Remaining</div>
                  <div className={`text-lg sm:text-xl lg:text-2xl font-black tabular-nums ${timeRemaining <= 60 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">Secure Portal</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <span>{answeredCount} Answered</span>
              <span>{totalQuestions - answeredCount} Remaining</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200/50">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Question Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {/* Question Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 leading-relaxed">
                {currentQuestion}. {question.question}
              </h2>
            </div>

            {/* Question Image */}
            {question.image && (
              <div className="mb-8">
                <img
                  src={question.image}
                  alt="Question"
                  className="w-full max-w-xl h-auto rounded-xl border border-gray-200 shadow-sm mx-auto"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">Select the correct answer:</h3>
              <div className="space-y-4">
                {question.options
                  ?.slice()
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .map((option: any, index: number) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = selectedAnswer === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => onAnswerSelect(option.id)}
                        className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[56px] ${isSelected
                          ? "bg-blue-50 border-blue-600 shadow-sm"
                          : "bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50/50"
                          }`}
                      >
                        <div className="flex items-center h-6">
                          <input
                            id={`option-${option.id}`}
                            type="radio"
                            name="question-option"
                            value={option.id}
                            checked={isSelected}
                            readOnly
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-black text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {letter}
                            </span>
                            <span className={`text-base sm:text-lg font-bold leading-relaxed ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                              {option.option?.option?.option ?? option.text ?? "No label"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100 mt-8">
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={onPrevious}
                  disabled={currentQuestion === 1}
                  className={`flex-1 sm:flex-none px-8 py-4 text-base font-black rounded-xl transition-all border-2 active:scale-[0.98] min-h-[52px] ${currentQuestion === 1
                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                    }`}
                >
                  PREVIOUS
                </button>

                {!isLastQuestion && (
                  <button
                    onClick={handleNext}
                    disabled={!selectedAnswer || isSubmitting}
                    className={`flex-1 sm:flex-none px-10 py-4 text-base font-black text-white rounded-xl transition-all flex items-center justify-center min-w-[160px] shadow-lg active:scale-[0.98] min-h-[52px] ${!selectedAnswer || isSubmitting
                      ? "bg-blue-200 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                      }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "NEXT QUESTION"
                    )}
                  </button>
                )}
              </div>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitTest}
                  disabled={!selectedAnswer || isSubmitting || isSubmittingAnswer}
                  className={`w-full sm:w-auto px-12 py-4 text-base font-black text-white rounded-xl transition-all flex items-center justify-center min-w-[200px] shadow-lg active:scale-[0.98] min-h-[52px] ${!selectedAnswer || isSubmitting || isSubmittingAnswer
                    ? "bg-green-200 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-green-100"
                    }`}
                >
                  {isSubmitting || isSubmittingAnswer ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      SUBMITTING...
                    </>
                  ) : (
                    "FINISH EXAMINATION"
                  )}
                </button>
              ) : (
                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">
                  Progress auto-saved
                </div>
              )}
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col h-fit lg:sticky lg:top-28">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.1em]">Navigation</h3>
              <p className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {answeredCount}/{totalQuestions}
              </p>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const questionNum = i + 1;
                const questionId = questions[i]?.id;
                const isAnswered = questionId && allAnswers[questionId];
                const isCurrent = questionNum === currentQuestion;

                return (
                  <button
                    key={questionNum}
                    onClick={() => onQuestionNavigate?.(i)}
                    className={`h-9 w-9 rounded-lg text-xs font-black transition-all duration-200 active:scale-95 flex items-center justify-center min-h-[44px] min-w-[44px] ${isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-100"
                      : isAnswered
                        ? "bg-green-50 text-green-700 border border-green-100 hover:bg-green-100"
                        : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                  >
                    {questionNum}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Current</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-50 border border-green-100 rounded-sm"></div>
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded-sm"></div>
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
