import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { RootState } from '../../redux/stores';

export function TestResults() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsFromState = useSelector((state: RootState) => state.test.results);
  const resultsFromLocation = location.state?.testResults;
  const results = resultsFromState || resultsFromLocation;
  useEffect(() => {
    if (!results && testId) {
      navigate(`/test/${testId}`, { replace: true });
    }
  }, [results, testId, navigate]);

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your test results. Please try again.</p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    score,
    pointsEarned,
    totalPoints,
    isPassed,
    details = [],
    submittedAt,
    timeSpent
  } = results;
  const submissionTime = new Date(submittedAt).toLocaleString();
  const timeSpentMinutes = Math.floor(timeSpent / 60);
  const timeSpentSeconds = timeSpent % 60;

  interface ProgressBarProps {
    value: number;
    className?: string;
  }
  
  const ProgressBar = ({ value, className = '' }: ProgressBarProps) => (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  type BadgeVariant = 'success' | 'destructive' | 'default';

  const Badge = ({ 
    variant = 'default' as const, 
    children, 
    className = '' 
  }: { 
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
  }) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variantClasses = {
      success: 'bg-green-100 text-green-800',
      destructive: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Test
          </button>
          <div className="flex items-center">
            <Badge variant={isPassed ? 'success' : 'destructive'}>
              {isPassed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
            <p className="text-gray-500 mt-1">
              Submitted on {submissionTime} • {timeSpentMinutes}m {timeSpentSeconds}s
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-gray-900 mb-2">{score.toFixed(2)}%</div>
                <div className="text-gray-500">Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {pointsEarned} / {totalPoints}
                </div>
                <div className="text-gray-500">Points</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {details.filter((q: any) => q.isCorrect).length} / {details.length}
                </div>
                <div className="text-gray-500">Correct Answers</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{score.toFixed(2)}%</span>
              </div>
              <ProgressBar value={score} />
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
            <p className="text-gray-500 mt-1">
              Review your answers and see the correct solutions
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {details.map((question: any, index: number) => (
                <div 
                  key={question.questionId} 
                  className={`p-4 rounded-lg border ${
                    question.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        Question {index + 1}: {question.question}
                      </h3>
                      
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          {question.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span>Your answer: {question.userAnswer[0] || 'No answer'}</span>
                        </div>
                        
                        {!question.isCorrect && (
                          <div className="flex items-center text-sm text-green-700 mt-1">
                            <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>Correct answer: {question.correctAnswers[0]?.option}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={question.isCorrect ? 'success' : 'destructive'}
                        className="whitespace-nowrap"
                      >
                        {question.isCorrect ? 'Correct' : 'Incorrect'} • {question.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate(`/test/${testId}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Retake Test
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResults;