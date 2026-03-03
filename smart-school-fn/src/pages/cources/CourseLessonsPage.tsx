import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  PlayCircle,
  List,
  FileText,
  Award,
  MessageSquare,
} from "lucide-react";
import {
  clearLessons,
  fetchLessons,
  setPage,
} from "../../redux/features/lessons/lessonSlice";
import { fetchTestsByCourseId } from "../../redux/features/test/testSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
import {
  HeaderSkeleton,
  LessonSkeleton,
} from "../../components/Skeletons/LessonSekleton";
import {
  LoginRequestModal,
  PaymentRequestModal,
} from "../../components/RequestModal";
import { jwtDecode } from "jwt-decode";

const TEST_TYPES = {
  GENERAL: "GENERAL",
  PSYCHOMETRIC: "PSYCHOMETRIC",
  OPENENDED: "OPENENDED",
  INTERVIEW: "INTERVIEW",
} as const;

type TestType = keyof typeof TEST_TYPES;
type TabType = "lessons" | TestType;

const CourseLessonsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<TabType>("lessons");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const subscribed = queryParams.get("subscribed");

  /** Redux state */
  const {
    items: lessons,
    pagination,
    loading: lessonsLoading,
    error: lessonsError,
  } = useSelector((state: RootState) => state.lessons);

  const {
    tests = [],
    loading: testsLoading,
    error: testsError,
  } = useSelector((state: RootState) => state.test);

  const filteredTests = tests.filter((test) => {
    if (activeTab === "GENERAL") return !test.type || test.type === "GENERAL";
    return test.type === activeTab;
  });

  /** Check token for login modal */
  useEffect(() => {
    const localToken = localStorage.getItem("accessToken");
    const studentToken = localStorage.getItem("accessToken_student");
    if (!localToken && !studentToken) setIsModalOpen(true);
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
  const token = localStorage.getItem("accessToken") || localStorage.getItem("accessToken_student");

  let decodedUser: any = null;
  if (token) {
    try {
      decodedUser = jwtDecode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  /** Payment modal logic */
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || localStorage.getItem("student") || decodedUser;
    if (storedUser) {
      const userData =
        typeof storedUser === "string" ? JSON.parse(storedUser) : storedUser;

      // Skip payment for students or specific staff roles
      const isStudent = !!localStorage.getItem("accessToken_student") || userData.actorType === "STUDENT";
      const isStaffPriveleged = userData.role === "ADMIN" || userData.role === "INSTRUCTOR" || userData.role === "SUPER_ADMIN";

      const isRestricted = !isStaffPriveleged && !isStudent;

      const requiresPayment = course?.type !== "free";

      if (isRestricted && subscribed === "false" && requiresPayment) {
        setShowPaymentModal(true);
      }
    }
  }, [subscribed, decodedUser, course?.type]);

  const handlePaymentContinue = () => navigate(`/tuition`);

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    navigate(-1);
  };

  /** Fetch Lessons */
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

  /** Fetch Tests */
  useEffect(() => {
    if (activeTab !== "lessons" && courseId) {
      dispatch(fetchTestsByCourseId(courseId));
    }
  }, [activeTab, courseId, dispatch]);

  const handleStartLearning = (lessonId: string) =>
    navigate(`/lessons/${lessonId}`);

  const handleTakeTest = (testId: string) =>
    navigate(`/test/${testId}`, { state: { fromCourse: true } });

  /** Loading Skeleton */
  if (lessonsLoading && lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          <HeaderSkeleton />
          <div className="bg-white shadow sm:rounded-lg divide-y mt-4">
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
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm cursor-pointer border border-slate-200 rounded-full px-5 py-2.5 bg-white text-slate-600 hover:bg-slate-50 transition-all mb-8 font-semibold uppercase tracking-wider text-[11px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-[#1a7ea5]" /> Back to courses
        </button>

        {/* Course Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          {course?.title}
        </h1>
        <p className="text-slate-500 mb-8 font-medium leading-relaxed max-w-3xl">{course?.description}</p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 lg:justify-center justify-start px-2">
            {[
              { key: "lessons", label: "Lessons", icon: List },
              { key: "GENERAL", label: "General Exams", icon: FileText },
              { key: "PSYCHOMETRIC", label: "Psychometric", icon: Award },
              { key: "OPENENDED", label: "Open Ended", icon: MessageSquare },
              { key: "INTERVIEW", label: "Interview Exams", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`${activeTab === tab.key
                    ? "border-[#1a7ea5] text-[#1a7ea5] bg-[#1a7ea5]/5"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200 hover:bg-slate-50/50"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-bold text-[11px] sm:text-xs flex items-center transition-all duration-200 rounded-t-xl uppercase tracking-widest`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.key ? 'text-[#1a7ea5]' : 'text-slate-300'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lessons */}
        {activeTab === "lessons" && (
          <div className="bg-white shadow sm:rounded-lg divide-y">
            {lessonsError && (
              <div className="p-6 text-center text-red-500">{lessonsError}</div>
            )}

            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-xl bg-[#1a7ea5]/10 flex items-center justify-center text-[#1a7ea5] font-bold">
                      {lesson.order}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-bold text-slate-900">
                          {lesson.title}
                        </h3>

                        {lesson.isPreview && (
                          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                            Preview
                          </span>
                        )}
                      </div>

                      <p className="text-gray-500 mt-1">{lesson.description}</p>

                      {lesson.content?.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-center text-[13px] text-slate-500 font-medium mt-3"
                        >
                          <PlayCircle className="w-4 h-4 mr-2 text-[#1a7ea5]/60" />
                          <span>{content.title || "Lesson Content"}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleStartLearning(lesson.id)}
                      className="ml-4 px-6 py-2.5 bg-[#1a7ea5] text-white rounded-full hover:bg-[#156d8f] transition-all font-bold uppercase tracking-widest text-[11px]"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No Lessons Available
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => dispatch(setPage(pagination.page - 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((num) => (
                    <button
                      key={num}
                      onClick={() => dispatch(setPage(num))}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${num === pagination.page
                        ? "bg-[#1a7ea5] text-white"
                        : "bg-white text-slate-400 border border-slate-100 hover:border-[#1a7ea5] hover:text-[#1a7ea5]"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => dispatch(setPage(pagination.page + 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tests Section */}
        {activeTab !== "lessons" && (
          <div className="mt-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {activeTab === "GENERAL" && "General Tests"}
              {activeTab === "PSYCHOMETRIC" && "Psychometric Tests"}
              {activeTab === "OPENENDED" && "Open Ended Tests"}
              {activeTab === "INTERVIEW" && "Interview Tests"}
            </h2>

            {testsLoading ? (
              <div className="text-center py-4 animate-pulse">Loading tests...</div>
            ) : testsError ? (
              <div className="text-center text-red-500">{testsError}</div>
            ) : filteredTests.length > 0 ? (
              <div className="grid gap-4 ">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer"
                    onClick={() => handleTakeTest(test.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {test.title}
                        </h3>
                        <p className="text-normal text-gray-500 mt-1 line-clamp-2 leading-tight">
                          {test.description ? test.description.substring(0, 250) + (test.description.length > 250 ? '...' : '') : 'No description available'}
                        </p>
                      </div>
                      <div className="flex gap-2 px-6 py-3 rounded-full bg-[#1a7ea5] font-bold text-white text-[11px] uppercase tracking-widest hover:bg-[#156d8f] transition-all cursor-pointer items-center">
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Exam</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No {activeTab.toLowerCase()} tests available.
              </div>
            )}
          </div>
        )}

        {/* Modals */}
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
