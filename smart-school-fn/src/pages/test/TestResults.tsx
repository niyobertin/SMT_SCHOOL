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
      <div className="flex items-center justify-center py-20 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Results Found</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">We couldn't find your test results. They may still be processing or the session expired.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
            >
              Dashboard
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
    submittedAt
  } = results;
  const submissionTime = new Date(submittedAt).toLocaleString();


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
    <div className="py-4 px-2 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Action */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => navigate('/student/available-tests')}
            className="flex items-center text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-[#1a7ea5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Available Tests
          </button>
          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {isPassed ? 'Passed' : 'Failed'}
          </div>
        </div>

        {/* Results Hero Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className={`p-8 text-center ${isPassed ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
            <div className="flex justify-center mb-6">
              {isPassed ? (
                <div className="p-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="p-4 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-slate-500 font-medium mb-2">
              {isPassed
                ? "You've successfully passed the assessment."
                : "You didn't reach the passing score this time."}
            </p>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Submitted on {submissionTime}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center group hover:border-[#1a7ea5]/20 transition-all">
                <div className="text-4xl font-black text-slate-900 mb-1">{score.toFixed(1)}%</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Final Grade</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center group hover:border-[#1a7ea5]/20 transition-all">
                <div className="text-4xl font-black text-slate-900 mb-1">
                  {pointsEarned} <span className="text-slate-300">/</span> {totalPoints}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Points</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center group hover:border-[#1a7ea5]/20 transition-all">
                <div className="text-4xl font-black text-slate-900 mb-1">
                  {details.filter((q: any) => q.isCorrect).length} <span className="text-slate-300">/</span> {details.length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Accuracy</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Performance Goal</span>
                <span className={`text-xs font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>{score.toFixed(1)}% Achieved</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isPassed ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-rose-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
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
                  className={`p-4 rounded-lg border ${question.isCorrect
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