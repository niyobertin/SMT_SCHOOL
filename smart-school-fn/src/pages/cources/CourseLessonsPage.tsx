import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, PlayCircle, List, FileText } from "lucide-react";
import {
  clearLessons,
  fetchLessons,
  setPage,
} from "../../redux/features/lessons/lessonSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
// import { FaQuestion } from 'react-icons/fa6';
import {
  HeaderSkeleton,
  LessonSkeleton,
} from "../../components/Skeletons/LessonSekleton";
import {
  LoginRequestModal,
  PaymentRequestModal,
} from "../../components/RequestModal";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CourseLessonsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const subscribed = queryParams.get("subscribed");

  const {
    items: lessons,
    pagination,
    loading: lessonsLoading,
    error: lessonsError,
  } = useSelector((state: RootState) => state.lessons);

  useEffect(() => {
    const localToken = localStorage.getItem("accessToken");
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
    navigate("/login");
  };
  const course = lessons[0]?.course;
  const token = localStorage.getItem("accessToken");
  let decodedUser = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      // If decoded is a JwtPayload, it will have the user data directly
      // If it's a string, it's already the user data
      decodedUser = typeof decoded === "string" ? JSON.parse(decoded) : decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("user") || decodedUser;
    if (user) {
      const userData = typeof user === "string" ? JSON.parse(user) : user;
      const isRestrictedRole =
        userData.role !== "ADMIN" && userData.role !== "INSTRUCTOR";

      const requiresPayment =
        course?.type === undefined || course.type !== "free";

      if (isRestrictedRole && subscribed === "false" && requiresPayment) {
        setShowPaymentModal(true);
      }
    }
  }, [subscribed, decodedUser, course?.type]);

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
      dispatch(
        fetchLessons({
          courseId,
          page: pagination.page,
          limit: pagination.limit,
        })
      );
    }

    return () => {
      dispatch(clearLessons());
      dispatch({ type: "test/clearTests" });
    };
  }, [courseId, dispatch, pagination.page, pagination.limit]);

  const handleStartLearning = (lessonId: string) =>
    navigate(`/lessons/${lessonId}`);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {course?.title}
          </h1>
          <p className="text-gray-600 mb-4">{course?.description}</p>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
              >
                <List className="w-4 h-4 mr-2" />
                Lessons
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
            {lessonsError ? (
              <div className="p-6 text-center text-red-500">
                {lessonsError}
              </div>
            ) : lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {lesson.order}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {lesson.title}
                        </h3>
                        {lesson.isPreview && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Preview
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {lesson.description}
                      </p>

                      {lesson.content?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {lesson.content.map((content) => (
                            <div
                              key={content.id}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{content.title || "Lesson Content"}</span>
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
                    This course doesn’t have any lessons yet. Please check
                    back later or explore other courses.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t mt-6 gap-2">
                {/* Previous Button */}
                <button
                  disabled={pagination.page === 1}
                  onClick={() => dispatch(setPage(pagination.page - 1))}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2 overflow-x-auto">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((num) => (
                    <button
                      key={num}
                      onClick={() => dispatch(setPage(num))}
                      className={`px-3 py-1 rounded-lg text-sm border whitespace-nowrap ${num === pagination.page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => dispatch(setPage(pagination.page + 1))}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </div>
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
