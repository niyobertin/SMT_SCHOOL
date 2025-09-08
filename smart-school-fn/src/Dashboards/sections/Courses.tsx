import { Plus, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "../../redux/features/courses/courseSlice";
import { CourseForm } from "../Modals/CourseForm";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";
import type { AppDispatch, RootState } from "../../redux/stores";

interface CoursesSectionProps {
  // Remove setActiveSection as we'll use routing
}

export const CoursesSection = ({}: CoursesSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    items: courses, 
    loading, 
    error,
  } = useSelector((state: RootState) => state.courses);

  const totalPages = Math.ceil((courses.length || 0) / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  useEffect(() => {
    dispatch(fetchCourses({ 
      page: currentPage, 
      limit: itemsPerPage
    }));
  }, [dispatch, currentPage]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/dashboard/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading courses: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No courses found</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewCourse(course.id)}
              >
                <div className="">
                <div className="h-48 bg-gray-200 relative">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        {course.level}
                      </div>
                    </div>
                  <div className="flex justify-between items-start mb-3 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu click
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 p-4">
                    {course.description || 'No description available.'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 p-4">
                    <span>{course.lessons?.length || 0} Lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage}
                  className={`p-2 rounded-md ${
                    hasPreviousPage
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className={`p-2 rounded-md ${
                    hasNextPage
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Course Form Modal */}
      <CourseForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          dispatch(fetchCourses({ page: currentPage, limit: itemsPerPage }));
        }}
      />
    </div>
  );
};