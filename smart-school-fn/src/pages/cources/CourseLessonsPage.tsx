import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Clock, PlayCircle, Award, List, FileText } from 'lucide-react';
import { fetchLessons } from '../../redux/features/lessons/lessonSlice';
import { fetchTestsByCourseId } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';
import { FaQuestion } from 'react-icons/fa6';
import { HeaderSkeleton, LessonSkeleton } from '../../components/Skeletons/LessonSekleton';
import { LoginRequestModal, PaymentRequestModal } from '../../components/RequestModal';
import { useLocation } from "react-router-dom";

const CourseLessonsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const subscribed = queryParams.get("subscribed");

  const { items: lessons, loading: lessonsLoading, error: lessonsError } = useSelector(
    (state: RootState) => state.lessons
  );
  const { tests, loading: testsLoading, error: testsError } = useSelector(
    (state: RootState) => state.test
  );

  useEffect(() => {
    const localToken = localStorage.getItem('accessToken');
    if (!localToken) {
      setIsModalOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const handleContinue = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  const course = lessons[0]?.course;

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (
        userData.role !== 'ADMIN' &&
        userData.role !== 'INSTRUCTOR' &&
        subscribed === 'false' &&
        course?.type !== 'free'
      ) {
        setShowPaymentModal(true);
      }
    }
  }, [subscribed]);

  const handlePaymentContinue = () => {
    setShowPaymentModal(false);
    navigate(`/tuition`);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    navigate(-1);
  };



  useEffect(() => {
    if (courseId) {
      dispatch(fetchLessons(courseId));
    }
    return () => {
      dispatch({ type: 'lessons/clearLessons' });
      dispatch({ type: 'test/clearTests' });
    };
  }, [courseId, dispatch]);

  useEffect(() => {
    if (activeTab === 'tests' && courseId) {
      dispatch(fetchTestsByCourseId(courseId));
    }
  }, [activeTab, courseId, dispatch]);

  const handleStartLearning = (lessonId: string) => navigate(`/lessons/${lessonId}`);
  const handleTakeTest = (testId: string) =>
    navigate(`/test/${testId}`, { state: { fromCourse: true } });

  // Initial skeleton while first lessons are loading
  if (lessonsLoading && !lessons.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeaderSkeleton />
          <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <LessonSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm cursor-pointer hover:bg-blue-600 hover:text-white mb-6 border border-gray-200 rounded-md p-2 bg-blue-600 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to courses
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-gray-600 mb-4">{course?.description}</p>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`${activeTab === 'lessons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <List className="w-4 h-4 mr-2" />
                Lessons
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`${activeTab === 'tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Tests
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'lessons' ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
              {lessonsError ? (
                <div className="p-6 text-center text-red-500">{lessonsError}</div>
              ) : lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                          {lesson.isPreview && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Preview
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>

                        {lesson.content?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {lesson.content.map((content) => (
                              <div key={content.id} className="flex items-center text-sm text-gray-600">
                                <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                                <span>{content.title || 'Lesson Content'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartLearning(lesson.id)}
                        className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 text-gray-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      No Lessons Available
                    </h2>
                    <p className="text-gray-600 text-sm">
                      This course doesn’t have any lessons yet. Please check back later or explore other courses.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
              {testsError ? (
                <div className="p-6 text-center text-red-500">{testsError}</div>
              ) : testsLoading && !tests.length ? (
                <div className="p-6">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : tests.length > 0 ? (
                tests.map((test: any) => (
                  <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Duration: {test.duration} minutes
                          </p>
                          <p className="flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            Passing Score: {test.passingScore}%
                          </p>
                          <p className="flex items-center">
                            <FaQuestion className="w-4 h-4 mr-2" />
                            Questions: {test.questions.length}
                          </p>
                          Max Attempts: {test.maxAttempts || 'Unlimited'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleTakeTest(test.id)}
                        className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                      >
                        Start Test
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 text-gray-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      No Tests Available
                    </h2>
                    <p className="text-gray-600 text-sm">
                      This course doesn’t have any tests yet. Please check back later or explore other courses.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <LoginRequestModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onContinue={handleContinue}
          featureName="lessons from the course"
        />

        <PaymentRequestModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onGoToPricing={handlePaymentContinue}
        />

      </div>
    </div>
  );
};

export default CourseLessonsPage;
