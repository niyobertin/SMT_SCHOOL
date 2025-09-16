import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TestInstructions } from '../../components/test/TestInstructions';
import { TestQuestion } from '../../components/test/TestQuestion';
import { startTest, submitTestAttempt, saveAnswer, startTestAttempt } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';
import { BackButton } from '../../components/common/BackButton';

export function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { test, questions, loading, error, testAttempt } = useSelector(
    (state: RootState) => state.test
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any | null>(null);
  const attemptIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (testId) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestStarted(false);
      dispatch(startTest(testId));
    }
  }, [dispatch, testId]);
  const handleStartTest = async () => {
    if (!testId) return;

    try {
      const result: any = await dispatch(startTestAttempt(testId)).unwrap();
      attemptIdRef.current = result.id;
      setTestStarted(true);

      const durationSeconds = (test.data?.duration ?? 0) * 60;
      setTimeLeft(durationSeconds);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (attemptIdRef.current) {
              autoSubmit(attemptIdRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start test attempt:', err);
    }
  };

  /** Cleanup timer */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const autoSubmit = async (attemptId: string) => {
    if (!attemptId || !testId) return;

    try {
      await dispatch(submitTestAttempt(attemptId));
      navigate(`/test/${testId}/results`);
    } catch (err) {
      console.error('Failed to submit test:', err);
    }
  };


  /** Answer selection */
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    if (testAttempt?.id) {
      dispatch(saveAnswer({ questionId, answer: answerId }));
    }
  };

  /** Navigation */
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  /** Submit test */
  const handleSubmit = async () => {
    if (!testAttempt?.id || !testId) return;
    try {
      await dispatch(submitTestAttempt(testAttempt.id));
      navigate(`/test/${testId}/results`);
    } catch (err) {
      console.error('Failed to submit test:', err);
    }
  };

  /** Error */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Test</h2>
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

  /** Instructions */
  if (!testStarted && test?.data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <BackButton className="mb-4" />
          </div>
          <TestInstructions
            test={{
              title: test.data.title,
              description: test.data.description,
              instructions: test.data.instructions || [
                'Read each question carefully before answering.',
                'You have a limited time to complete the test.',
                'Once you select an answer, you cannot change it.',
                'Make sure to submit the test before the time runs out.'
              ],
              duration: test.data.duration,
              passingScore: test.data.passingScore
            }}
            onStart={handleStartTest}
          />
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Test</h2>
          <p className="text-gray-600 mb-6">Please wait while the test is loading...</p>
        </div>
      </div>
    );
  }
  /** Questions */
  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <BackButton />
        </div>
        <TestQuestion
          question={currentQuestion}
          totalQuestions={questions.length}
          currentQuestion={currentQuestionIndex + 1}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerSelect={(answerId) => handleAnswerSelect(currentQuestion.id, answerId)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          timeRemaining={timeLeft}
          onSubmit={handleSubmit}
          testAttemptId={testAttempt?.id}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>No test content available.</p>
    </div>
  );
}
