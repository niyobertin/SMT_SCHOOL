import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react';

import { 
  fetchTestById, 
  startTestAttempt, 
  submitTestAnswer, 
  submitTestAttempt, 
  setCurrentQuestion, 
  saveAnswer, 
  updateTimeRemaining,
  resetTest 
} from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';

type QuizState = 'instructions' | 'taking' | 'completed' | 'reviewing';

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get test state from Redux
  const {
    test,
    questions,
    currentQuestionIndex,
    answers,
    testAttempt,
    loading,
    error,
    timeRemaining,
    isSubmitting,
    results
  } = useSelector((state: RootState) => state.test);
  
  const [quizState, setQuizState] = useState<QuizState>('instructions');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Load test data
  useEffect(() => {
    if (testId) {
      dispatch(fetchTestById(testId));
    }
    
    return () => {
      dispatch(resetTest());
    };
  }, [testId, dispatch]);

  // Timer effect
  useEffect(() => {
    if (quizState !== 'taking' || !timeRemaining) return;
    
    const timer = setInterval(() => {
      dispatch(updateTimeRemaining(timeRemaining - 1));
      
      if (timeRemaining <= 1 && testAttempt?.id) {
        handleSubmitTest();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, quizState, testAttempt?.id, dispatch]);

  // Handle starting the test
  const handleStartTest = async () => {
    if (!testId) return;
    
    try {
      await dispatch(startTestAttempt(testId)).unwrap();
      setQuizState('taking');
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    if (!testAttempt || !questions[currentQuestionIndex]) return;
    
    setSelectedOption(optionIndex);
    
    // Save answer locally
    dispatch(saveAnswer({
      questionIndex: currentQuestionIndex,
      answer: optionIndex
    }));
    
    // Submit answer to server
    dispatch(submitTestAnswer({
      attemptId: testAttempt.id,
      questionId: questions[currentQuestionIndex].id,
      answer: optionIndex
    }));
  };

  // Handle navigation between questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(setCurrentQuestion(currentQuestionIndex + 1));
      setSelectedOption(answers[currentQuestionIndex + 1] ?? null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestion(currentQuestionIndex - 1));
      setSelectedOption(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testAttempt?.id) return;
    
    try {
      await dispatch(submitTestAttempt(testAttempt.id)).unwrap();
      setQuizState('completed');
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  // Calculate progress
  const progress = test ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // ================== LOADING STATE ==================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ================== ERROR STATE ==================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ================== INSTRUCTIONS SCREEN ==================
  if (quizState === 'instructions' && test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
          <h1 className="text-2xl font-bold mb-6">{test.title}</h1>
          
          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {test.instructions?.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              )) || <li>Read each question carefully before answering.</li>}
              <li>You have {test.duration} minutes to complete the test.</li>
              <li>Answers are saved automatically as you select them.</li>
              <li>You can navigate between questions using the Previous/Next buttons.</li>
              <li>Once submitted, you cannot change your answers.</li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    The timer will start as soon as you begin the test. Make sure you have enough time to complete it.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleStartTest}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================== TEST IN PROGRESS ==================
  if (quizState === 'taking' && test && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white shadow p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h1 className="font-bold">{test.title}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={timeRemaining < 300 ? "text-red-600 font-bold" : "text-gray-800"}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Time Remaining: {formatTime(timeRemaining)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div 
                className="h-2 bg-blue-600 rounded transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current question */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <p className="font-semibold mb-6">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded border ${
                    selectedOption === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded border ${
                currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="inline w-4 h-4 mr-1" /> Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ================== TEST RESULTS ==================
  if (quizState === 'completed' && results) {
    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    const passed = percentage >= test?.passingScore || 70;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 text-center">
          <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? (
              <CheckCircle className="text-green-600 w-10 h-10" />
            ) : (
              <XCircle className="text-red-600 w-10 h-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Test Completed Successfully!' : 'Test Completed'}
          </h2>
          
          <p className="text-gray-600 mb-8">
            {passed 
              ? 'Congratulations! You have passed the test.'
              : `You need ${test?.passingScore || 70}% to pass. You can retake the test.`}
          </p>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold">{results.correctAnswers}</div>
              <p className="text-sm text-gray-500">Correct Answers</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold">{percentage}%</div>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold">{results.totalQuestions}</div>
              <p className="text-sm text-gray-500">Total Questions</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setQuizState('reviewing')} 
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Review Answers
            </button>
            <button 
              onClick={handleStartTest} 
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================== ANSWER REVIEW ==================
  if (quizState === 'reviewing' && test && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Test Review: {test.title}</h2>
          
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id} 
                  className={`p-6 bg-white rounded-lg shadow border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold">Question {index + 1}</h3>
                    <span className={`text-sm font-medium ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="mb-4">{question.question}</p>
                  
                  <div className="space-y-2 mb-4">
                    {question.options?.map((option: string, optIndex: number) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isRightAnswer = question.correctAnswer === optIndex;
                      
                      return (
                        <div 
                          key={optIndex}
                          className={`p-3 rounded border ${
                            isRightAnswer 
                              ? 'border-green-500 bg-green-50' 
                              : isUserAnswer 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-200'
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isCorrect && question.explanation && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-medium text-blue-900">Explanation</p>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => setQuizState('completed')} 
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any unexpected state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">Unable to load the test. Please try again later.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
