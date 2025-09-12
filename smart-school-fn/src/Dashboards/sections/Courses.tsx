import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteCourse, fetchCourses} from "../../redux/features/courses/courseSlice";
import { CourseForm } from "../Modals/CourseForm";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface CoursesSectionProps {}

export const CoursesSection = ({}: CoursesSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useRef<Toast>(null);
  
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

  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEditingCourse(course);
      setIsModalOpen(true);
    }
  };

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await dispatch(deleteCourse(courseToDelete)).unwrap();
      dispatch(fetchCourses({ 
        page: currentPage, 
        limit: itemsPerPage
      }));
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Course deleted successfully',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete course',
        life: 3000
      });
    } finally {
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    // Refresh courses
    dispatch(fetchCourses({ 
      page: currentPage, 
      limit: itemsPerPage
    }));
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
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add New Course
        </button>
      </div>

      <Dialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        header="Confirm Delete"
        modal
        footer={
          <div>
            <Button 
              label="No" 
              icon="pi pi-times" 
              onClick={() => setShowDeleteDialog(false)} 
              className="p-button-text"
            />
            <Button 
              label="Yes" 
              icon="pi pi-check" 
              onClick={confirmDelete} 
              autoFocus 
              className="p-button-danger"
            />
          </div>
        }
      >
        <p>Are you sure you want to delete this course? This action cannot be undone.</p>
      </Dialog>

      {isModalOpen && (
        <CourseForm
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCourse(null);
          }}
          onSuccess={handleFormSuccess}
          course={editingCourse}
        />
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No courses found</p>
          <button
            onClick={() => {
              setEditingCourse(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course,index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 relative">
                  {course?.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course?.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course?.description || 'No description available.'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <button 
                      onClick={() => handleViewCourse(course.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Eye size={16} /> 
                      {course?.lessons?.length || 0} Lessons
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourse(course.id);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                        title="Edit course"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(course.id);
                        }}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage}
                className={`p-2 rounded-full ${hasPreviousPage ? 'hover:bg-gray-100' : 'opacity-50'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className={`p-2 rounded-full ${hasNextPage ? 'hover:bg-gray-100' : 'opacity-50'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesSection;