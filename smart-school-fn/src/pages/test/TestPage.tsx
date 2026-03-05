import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { TestInstructions } from '../../components/test/TestInstructions';
import { TestQuestion } from '../../components/test/TestQuestion';
import { OpenEndedTestQuestion } from '../../components/test/OpenEndedTestQuestion';
import { TestReviewPage } from '../../components/test/TestReviewPage';
import { SubmissionSuccessModal } from '../../components/test/SubmissionSuccessModal';
import { PsychometricTestPage } from './PsychometricTestPage';
import { InterviewTestPage } from './InterviewTestPage';
import { startTest, submitTestAttempt, saveAnswer, submitAnswer, startTestAttempt } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';
import { BackButton } from '../../components/common/BackButton';

export function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { test, questions, loading, error, testAttempt } = useSelector(
    (state: RootState) => state.test
  );

  // Declare all hooks first (before any conditional returns)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openEndedResponses, setOpenEndedResponses] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any | null>(null);
  const attemptIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (testId) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setOpenEndedResponses({});
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
    } catch (err: any) {
      console.error('Failed to start exam attempt:', err);
      toast.error(err.message || 'Failed to start exam. Please try again.');
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
      await dispatch(submitTestAttempt(attemptId)).unwrap();
      const resultsPath = location.pathname.startsWith('/student')
        ? `/student/test-results/${testId}`
        : `/test/${testId}/results`;
      navigate(resultsPath);
    } catch (err: any) {
      console.error('Failed to submit exam:', err);
      toast.error(err.message || 'Failed to auto-submit exam.');
    }
  };


  /** Answer selection */
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    if (testAttempt?.id) {
      dispatch(saveAnswer({ questionId, answer: answerId }));

      // Submit answer to backend
      dispatch(submitAnswer({
        attemptId: testAttempt.id,
        questionId: questionId,
        selectedOptions: [answerId]
      })).unwrap().catch((err: any) => {
        console.error('Failed to save answer:', err);
        toast.error("Failed to save answer. Please check your connection.");
      });
    }
  };

  /** Navigation */
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (isOpenEnded) {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  /** Submit exam */
  const handleSubmit = async () => {
    if (!testAttempt?.id || !testId) return;
    try {
      const result = await dispatch(submitTestAttempt(testAttempt.id)).unwrap();

      // For OPENENDED tests, show success modal instead of navigating to results
      if (isOpenEnded) {
        setShowSuccessModal(true);
      } else {
        // Verify we have results before navigating
        if (result?.data || result?.score !== undefined) {
          const resultsPath = location.pathname.startsWith('/student')
            ? `/student/test-results/${testId}`
            : `/test/${testId}/results`;
          navigate(resultsPath);
        } else {
          toast.warning("Test submitted but no results returned. Please check your dashboard.");
          navigate(location.pathname.startsWith('/student') ? `/student/dashboard` : `/courses`);
        }
      }
    } catch (err: any) {
      console.error('Failed to submit exam:', err);
      toast.error(err.message || 'Failed to submit exam. Please try again.');
    }
  };

  const handleReviewSubmit = () => {
    setShowReview(false);
    handleSubmit();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(-1);
  };

  const handleRetakeTest = () => {
    setShowSuccessModal(false);
    setCurrentQuestionIndex(0);
    setOpenEndedResponses({});
    setTestStarted(false);
    if (testId) {
      dispatch(startTest(testId));
    }
  };

  // Check test type and route to appropriate component
  const testType = test?.data?.type || 'GENERAL';

  // Route to specific test type components
  if (testType === 'PSYCHOMETRIC') {
    return <PsychometricTestPage />;
  }

  if (testType === 'INTERVIEW') {
    return <InterviewTestPage />;
  }

  // For OPENENDED and GENERAL, continue with existing rendering below
  const isOpenEnded = testType === 'OPENENDED';

  /** Error */
  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Error Loading Test</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col space-y-3">
            <BackButton className="self-center" />
            <button
              onClick={() => testId && dispatch(startTest(testId))}
              className="px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
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
      <div className="py-4 px-2">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              Exam Instructions
            </div>
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
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-[#1a7ea5] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Loading Test</h2>
          <p className="text-slate-500 font-medium">Preparing your examination environment...</p>
        </div>
      </div>
    );
  }
  /** Questions */
  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    // Use OpenEndedTestQuestion for OPENENDED tests
    if (isOpenEnded) {
      // Show review page if requested
      if (showReview) {
        const reviewQuestions = questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          image: q.image || undefined,
          response: openEndedResponses[q.id] || '',
        }));

        return (
          <>
            <TestReviewPage
              testTitle={test.data.title}
              questions={reviewQuestions}
              onEdit={(index) => {
                setShowReview(false);
                setCurrentQuestionIndex(index);
              }}
              onSubmit={handleReviewSubmit}
              onBack={() => setShowReview(false)}
              isSubmitting={loading}
            />
            <SubmissionSuccessModal
              isOpen={showSuccessModal}
              testTitle={test.data.title}
              testType="OPENENDED"
              onClose={handleCloseSuccessModal}
              onRetake={handleRetakeTest}
              canRetake={true}
            />
          </>
        );
      }

      return (
        <div className="max-w-7xl mx-auto">
          <OpenEndedTestQuestion
            testTitle={test.data.title}
            question={currentQuestion}
            totalQuestions={questions.length}
            currentQuestion={currentQuestionIndex + 1}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            timeRemaining={timeLeft}
            onSubmit={() => setShowReview(true)}
            testAttemptId={testAttempt?.id}
            openEndedResponse={openEndedResponses[currentQuestion.id] || ''}
            onOpenEndedChange={(text) => {
              setOpenEndedResponses(prev => ({ ...prev, [currentQuestion.id]: text }));
            }}
          />
          <SubmissionSuccessModal
            isOpen={showSuccessModal}
            testTitle={test.data.title}
            testType="OPENENDED"
            onClose={handleCloseSuccessModal}
            onRetake={handleRetakeTest}
            canRetake={true}
          />
        </div>
      );
    }

    // Use TestQuestion for GENERAL tests
    return (
      <div className="max-w-7xl mx-auto">
        <TestQuestion
          testTitle={test.data.title}
          question={currentQuestion}
          totalQuestions={questions.length}
          currentQuestion={currentQuestionIndex + 1}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerSelect={(answerId) => handleAnswerSelect(currentQuestion.id, answerId)}
          handleNext={handleNext}
          onPrevious={handlePrevious}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          timeRemaining={timeLeft}
          handleSubmitTest={handleSubmit}
          testAttemptId={testAttempt?.id}
          onQuestionNavigate={(index) => setCurrentQuestionIndex(index)}
          allAnswers={answers}
          questions={questions}
          isSubmitting={loading}
          isSubmittingAnswer={loading}
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
