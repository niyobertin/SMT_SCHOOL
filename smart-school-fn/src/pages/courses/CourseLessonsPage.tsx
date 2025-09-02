import { useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Clock, PlayCircle, BookOpen, Award } from 'lucide-react';
import { fetchLessons } from '../../redux/features/lessons/lessonSlice';
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
  
  const { items: lessons, loading, error } = useSelector(
    (state: RootState) => state.lessons
  );
  
  const course = lessons[0]?.course;

  useEffect(() => {
    if (courseId) {
      dispatch(fetchLessons(courseId));
    }
    
    return () => {
      dispatch({ type: 'lessons/clearLessons' });
    };
  }, [courseId, dispatch]);

  const handleStartLearning = (lessonId: string) => {
    // Navigate to the first content item of the lesson
    navigate(`/lessons/${lessonId}`);
  };

  const handleTakeTest = () => {
    // Navigate to the test page
    navigate(`/courses/${courseId}/test`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Courses
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
              <p className="text-gray-600">{course?.shortDescription || course?.description}</p>
            </div>
            <button
              onClick={handleTakeTest}
              className="mt-4 md:mt-0 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Award className="h-5 w-5" />
              <span>Take Test</span>
            </button>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="flex items-center mr-4">
              <Clock className="h-4 w-4 mr-1" />
              {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {course?.level}
            </span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {lessons.map((lesson, index) => (
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
                  
                  {/* Lesson Content */}
                  {lesson.content.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {lesson.content.map((content) => (
                        <div key={content.id} className="flex items-center text-sm text-gray-600">
                          <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{content.title || 'Lesson Content'}</span>
                          {content.videoUrl && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                              Video
                            </span>
                          )}
                          {content.pdfUrl && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                              PDF
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <button
                    onClick={() => handleStartLearning(lesson.id)}
                    className="inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseLessonsPage;
