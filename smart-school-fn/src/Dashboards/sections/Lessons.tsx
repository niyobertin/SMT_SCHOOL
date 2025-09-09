import { useState, useEffect, useRef } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { LessonModal } from "../Modals/LessonModal";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createLesson, fetchLessons } from "../../redux/features/lessons/lessonSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from "primereact/toast";

interface LessonsProps {}

export const Lessons = ({}: LessonsProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const lessons = useSelector((state: RootState) => state.lessons);
  const loading = useSelector((state: RootState) => state.lessons.loading);
  const error = useSelector((state: RootState) => state.lessons.error);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toast = useRef<Toast>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchLessons(courseId));
    }
  }, [courseId, dispatch]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Deleting lesson:', deleteId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewLesson = (lessonId: string) => {
    navigate(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      setLessonLoading(true);
      await dispatch(createLesson({ ...lessonData, courseId })).unwrap();
      dispatch(fetchLessons(courseId!));
      setLessonLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Lesson Created",
        detail: "Lesson created successfully!",
        life: 3000,
      });
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setLessonLoading(false);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create lesson.",
        life: 3000,
      });
    }
  };

  const totalPages = Math.ceil(lessons.items.length / itemsPerPage);
  const paginatedLessons = lessons.items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading lessons: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lessons</h2>
        <button
          onClick={() => {
            setEditingLesson(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Lesson
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search lessons..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full lg:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lesson Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {lesson.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {lesson.course?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {lesson.content?.length || 0} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewLesson(lesson.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedLessons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No lessons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
        initialData={editingLesson}
        onSave={handleSaveLesson}
        loading={lessonLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
      />
      <Toast ref={toast} position="top-right"/>
    </div>
  );
};
