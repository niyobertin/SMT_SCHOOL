import { useState, useEffect } from 'react';
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
  
  const { test, questions, loading, error, timeRemaining, testAttempt } = useSelector(
    (state: RootState) => state.test
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);

  // Load test data when component mounts or testId changes
  useEffect(() => {
    if (testId) {
      // Reset state when testId changes
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestStarted(false);
      
      // Load test data
      dispatch(startTest(testId));
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [dispatch, testId]);

  // Handle starting the test
  const handleStartTest = async () => {
    if (testId) {
      try {
        // Start the test attempt and wait for it to complete
        await dispatch(startTestAttempt(testId));
        setTestStarted(true);
      } catch (error) {
        console.error('Failed to start test attempt:', error);
      }
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    // Save answer locally for immediate UI update
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));

    // Save answer to the server
    if (testAttempt?.id) {
      dispatch(saveAnswer({
        questionId,
        answer: answerId
      }));
    }
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle test submission
  const handleSubmit = async () => {
    if (!testAttempt?.id) {
      console.error('No test attempt ID found. Cannot submit test.');
      return;
    }
    
    if (!testId) {
      console.error('No test ID found. Cannot submit test.');
      return;
    }
    
    try {
      const result = await dispatch(submitTestAttempt(testAttempt.id));
      
      if (submitTestAttempt.fulfilled.match(result)) {
        navigate(`/test/${testId}/results`);
      } else {
        console.error('Failed to submit test:', result.error);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading test...</p>
        </div>
      </div>
    );
  }

  // Show error state
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

  // Show instructions if not started
  if (!testStarted && (test && test.data)) {
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

  // Show questions if test has started
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
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
          testAttemptId={testAttempt?.id}
        />
      </div>
    );
  }

  // Fallback if no content to display
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>No test content available.</p>
    </div>
  );
}
