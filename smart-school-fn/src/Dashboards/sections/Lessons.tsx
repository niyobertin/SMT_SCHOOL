import { useState, useEffect, useRef } from "react";
import { Plus, Eye, Edit, Trash2, BookOpen, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { LessonModal } from "../Modals/LessonModal";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearLessons, createLesson, deleteLesson, fetchLessons, setPage, updateLesson } from "../../redux/features/lessons/lessonSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from "primereact/toast";

export const Lessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const lessons = useSelector((state: RootState) => state.lessons);
  const { pagination } = useSelector((state: RootState) => state.lessons);
  const loading = useSelector((state: RootState) => state.lessons.loading);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toast = useRef<Toast>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchLessons({
        courseId,
        page: pagination.page,
        limit: pagination.limit
      }));
    }

    return () => {
      dispatch(clearLessons());
      dispatch({ type: 'test/clearTests' });
    };
  }, [courseId, dispatch, pagination.page, pagination.limit]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await dispatch(deleteLesson(deleteId)).unwrap();
      await dispatch(fetchLessons({
        courseId: courseId!,
        page: pagination.page,
        limit: pagination.limit
      })).unwrap();

      toast.current?.show({
        severity: "success",
        summary: "Lesson Deleted",
        detail: "Lesson deleted successfully!",
        life: 3000,
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: "An error occurred while deleting the lesson.",
        life: 3000,
      });
    }
  };

  const handleViewLesson = (lessonId: string) => {
    navigate(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      setLessonLoading(true);
      if (editingLesson) {
        await dispatch(updateLesson({ ...lessonData, id: editingLesson.id })).unwrap();
      } else {
        await dispatch(createLesson({ ...lessonData, courseId })).unwrap();
      }
      dispatch(fetchLessons({
        courseId: courseId!,
        page: pagination.page,
        limit: pagination.limit
      }));
      setLessonLoading(false);
      toast.current?.show({
        severity: "success",
        summary: editingLesson ? "Lesson Updated" : "Lesson Created",
        detail: editingLesson ? "Lesson updated successfully!" : "Lesson created successfully!",
        life: 3000,
      });
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      setLessonLoading(false);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save lesson.",
        life: 4000,
      });
    }
  };

  if (loading && lessons.items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
        <div className="h-96 bg-slate-50 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Toast ref={toast} position="top-right" />

      {/* Redesigned Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#1a7ea5] mb-2">
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="p-2 hover:bg-[#1a7ea5]/10 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Curriculum</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Lessons</h1>
          <p className="text-slate-500 font-medium mt-3">Structure your course content with modular lessons.</p>
        </div>
        <button
          onClick={() => {
            setEditingLesson(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 shrink-0"
        >
          <Plus size={16} />
          Add Lesson
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative group flex-1 max-w-md">
              <input
                type="text"
                placeholder="Find a lesson..."
                className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Total Lessons: {lessons.items.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lesson Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Module Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {lessons.items.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).map((lesson, idx) => (
                  <motion.tr
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1a7ea5]/10 rounded-xl flex items-center justify-center text-[#1a7ea5] group-hover:bg-[#1a7ea5] group-hover:text-white transition-all">
                          <BookOpen size={18} />
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {lesson.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        {lesson.course?.title || 'Standalone'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-600">{lesson.content?.length || 0} Assets</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex justify-end gap-2 transition-all">
                        <button
                          onClick={() => handleViewLesson(lesson.id)}
                          className="flex items-center gap-2 pl-4 pr-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => {
                            setEditingLesson(lesson);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 bg-white border border-slate-100 text-slate-500 hover:text-[#1a7ea5] hover:border-[#1a7ea5]/20 rounded-xl transition-all shadow-sm"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2.5 bg-white border border-slate-100 text-slate-500 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {lessons.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
                        <BookOpen size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">No lessons here</h3>
                      <p className="text-slate-400 font-medium mt-2">Start adding educational modules to this course.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-8 py-8 bg-slate-50/50 border-t border-slate-100 gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Page</span>
              <div className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-[#1a7ea5] shadow-sm">
                {pagination.page} / {pagination.totalPages}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => dispatch(setPage(pagination.page - 1))}
                className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl disabled:opacity-30 hover:text-[#1a7ea5] shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => dispatch(setPage(num))}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${num === pagination.page
                      ? 'bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/20 scale-105'
                      : 'bg-white border border-slate-100 text-slate-400 hover:border-[#1a7ea5]/30 shadow-sm'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => dispatch(setPage(pagination.page + 1))}
                className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl disabled:opacity-30 hover:text-[#1a7ea5] shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Destroy Lesson"
        message="This will permanently delete the lesson and all associated metadata. Proceed?"
      />
    </motion.div>
  );
};

export default Lessons;
