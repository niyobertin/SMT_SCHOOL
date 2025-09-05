import { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Clock, PlayCircle, Award, XCircle, List, FileText } from 'lucide-react';
import { fetchLessons } from '../../redux/features/lessons/lessonSlice';
import { fetchTestsByCourseId } from '../../redux/features/test/testSlice';
import type { AppDispatch, RootState } from '../../redux/stores';

// Skeleton Loader Components
const LessonSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-start">
      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      <div className="ml-4 flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded-md ml-4"></div>
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="mb-8 animate-pulse">
    <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
    <div className="h-48 w-full bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex space-x-4">
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const CourseLessonsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  
  const { items: lessons, loading: lessonsLoading, error: lessonsError } = useSelector(
    (state: RootState) => state.lessons
  );
  
  const { tests, loading: testsLoading, error: testsError } = useSelector(
    (state: RootState) => state.test
  );
  
  const course = lessons[0]?.course;
  const error = lessonsError || testsError;
  const loading = (activeTab === 'lessons' ? lessonsLoading : testsLoading) && !(activeTab === 'lessons' ? lessons.length : tests.length);

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

  const handleStartLearning = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  const handleTakeTest = (testId: string) => {
    // Navigate to the test page with the test ID
    navigate(`/test/${testId}`, { state: { fromCourse: true } });
  };

  if (loading && !lessons.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeaderSkeleton />
          <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
            {[...Array(3)].map((_, i) => (
              <LessonSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No lessons found</h2>
          <p className="text-gray-600">This course doesn't have any lessons yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
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

        {loading && !lessons.length ? (
          <HeaderSkeleton />
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course?.title}</h1>
            <p className="text-gray-600 mb-4">{course?.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{course?.duration || 'N/A'} hours</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                <span>{course?.level || 'All Levels'}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`${activeTab === 'lessons' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Lessons
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`${activeTab === 'tests' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Tests
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'lessons' ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
                {lessons.length > 0 ? (
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
                  <div className="p-6 text-center text-gray-500">
                    No lessons available for this course.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
                {testsLoading && !tests.length ? (
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
                            <p>Max Attempts: {test.maxAttempts || 'Unlimited'}</p>
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
                  <div className="p-6 text-center text-gray-500">
                    No tests available for this course.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLessonsPage;
