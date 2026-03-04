import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Eye, X, BookOpen, Layers, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { deleteCourse, fetchCourses, setPage } from "../../redux/features/courses/courseSlice";
import { CourseForm } from "../Modals/CourseForm";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { fetchCategories, createCategory } from "../../redux/features/courses/category";
import api from "../../redux/api/api";
import { StatsCard } from "../StatsCard";
import { CheckCircle2 } from "lucide-react";

export const CoursesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "categories">("courses");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useRef<Toast>(null);

  const {
    items: courses,
    loading,
    page,
    totalPages,
  } = useSelector((state: RootState) => state.courses);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(setPage(1));
    dispatch(
      fetchCourses({
        page: 1,
        limit: newItemsPerPage,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCourses({
      page,
      limit: itemsPerPage
    }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
  }, [dispatch]);

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
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Course deleted successfully',
        life: 3000
      });
      dispatch(fetchCourses({
        page,
        limit: itemsPerPage
      }));
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
    dispatch(fetchCourses({
      page,
      limit: itemsPerPage
    }));
  };

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const openModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setNewCategory({ name: "", description: "", isActive: true });
    }
    setShowCategoryModal(true);
  };

  const handleAddCategory = async () => {
    if (editingCategory) {
      try {
        await api.patch(`/categories/${editingCategory.id}`, newCategory);
        dispatch(fetchCategories({ page, limit: itemsPerPage }));
        toast.current?.show({
          severity: "success",
          summary: "Category Updated",
          detail: "Category updated successfully!",
          life: 3000,
        });
        setShowCategoryModal(false);
      } catch (error: any) {
        toast.current?.show({
          severity: "error",
          summary: "Category Failed",
          detail: "Category failed to update!",
          life: 3000,
        });
      }
    } else {
      try {
        await dispatch(createCategory({
          name: newCategory.name,
          description: newCategory.description,
          isActive: newCategory.isActive
        })).unwrap();

        setNewCategory({ name: "", description: "", isActive: true });
        toast.current?.show({
          severity: "success",
          summary: "Category Created",
          detail: "Category created successfully!",
          life: 3000,
        });
        setShowCategoryModal(false);
        dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
      } catch (error: any) {
        toast.current?.show({
          severity: "error",
          summary: "Category Failed",
          detail: "Category failed to create!",
          life: 3000,
        });
      }
    }
  };

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleCategoryDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Category deleted successfully',
        life: 3000
      });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete category' });
    }
  };


  const truncateDescription = (description: string, maxLength = 80) => {
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
  };

  if (loading && courses.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-0">
        {[...Array(6)].map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-0"
    >
      <Toast ref={toast} />

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Curriculum</h1>
          <p className="text-slate-500 font-medium mt-3">Design and organize your educational programs and tracks.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
            >
              <Plus size={16} />
              New Course
            </button>
          </div>
        )}
      </div>

      {/* High-Level Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tracks"
          value={courses.length}
          icon={BookOpen}
          color="bg-blue-500"
          change="Curriculum"
        />
        <StatsCard
          title="Active Tracks"
          value={courses.filter((c: any) => c.status === 'PUBLISHED').length}
          icon={CheckCircle2}
          color="bg-emerald-500"
          change="Live"
        />
        <StatsCard
          title="Segments"
          value={categories.length}
          icon={Layers}
          color="bg-purple-500"
          change="Categories"
        />
        <StatsCard
          title="Total Lessons"
          value={courses.reduce((acc: number, c: any) => acc + (c.lessons?.length || 0), 0)}
          icon={Plus}
          color="bg-amber-500"
          change="Content"
        />
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit border border-slate-100">
        <button
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "courses" ? "bg-white text-[#1a7ea5] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => setActiveTab("courses")}
        >
          <BookOpen size={14} />
          Courses
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "categories" ? "bg-white text-[#1a7ea5] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => setActiveTab("categories")}
        >
          <Layers size={14} />
          Categories
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "courses" ? (
          <motion.div
            key="courses-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="p-4 bg-slate-50 rounded-xl mb-6">
                  <BookOpen size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No courses yet</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-xs text-center">Start building your curriculum by creating your first course.</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                  >
                    Create Course
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course: any, idx: number) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a7ea5]/20 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                          {course?.status}
                        </span>
                        <span className="px-2 py-1 bg-[#1a7ea5] rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                          {course?.type}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={32} className="text-[#1a7ea5]/20" />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors line-clamp-1">{course?.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-1 leading-relaxed">
                        {course?.description || 'No detailed description provided for this track.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <Eye size={12} />
                          {course?.lessons?.length || 0} Lessons
                        </button>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditCourse(course.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(course.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Results</span>
                  <select
                    value={itemsPerPage}
                    onChange={e => handleItemsPerPageChange(Number(e.target.value))}
                    className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer"
                  >
                    {[9, 18, 27, 45, 90].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl disabled:opacity-30 hover:text-[#1a7ea5] transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-[#1a7ea5] text-white shadow-lg shadow-[#1a7ea5]/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    {totalPages > 5 && <span className="text-slate-300 px-1 font-black">...</span>}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl disabled:opacity-30 hover:text-[#1a7ea5] transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Categories</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">Classification and taxonomies</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => openModal()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Tag size={14} className="text-[#1a7ea5]" />
                  Create Category
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Courses</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {categories.map((category, idx) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 leading-none">{category.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-tighter">/{category.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                            {truncateDescription(category.description)}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-[#1a7ea5]">
                            {category.courses?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${category.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                            {category.isActive ? 'Active' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {isAdmin && (
                            <div className="flex items-center justify-end gap-2 transition-all">
                              <button
                                onClick={() => openModal(category)}
                                className="p-2 text-slate-400 hover:text-[#1a7ea5] hover:bg-blue-50 bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleCategoryDeleteClick(category.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Total curriculum spread: <span className="text-slate-900">{categories.length} segments</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Dialogs */}
      <ConfirmDeleteDialog
        visible={showDeleteDialog && !!courseToDelete}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this course track? This will remove all associated curriculum data."
      />

      <ConfirmDeleteDialog
        visible={showDeleteDialog && !!categoryToDelete}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteCategory}
        message="Deleting this category will affect course classification. Continue?"
      />

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

      {/* Category Modal - Modernized */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
          >
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-[#1a7ea5]/10 rounded-3xl text-[#1a7ea5]">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Manage Category</h3>
                <p className="text-sm font-medium text-slate-400">Classify your curriculum effectively.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">Segment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Business"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">Strategic Purpose</label>
                <textarea
                  placeholder="Describe what this category encompasses..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-3xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all h-32 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                <div className={`w-10 h-6 rounded-full relative transition-all ${newCategory.isActive ? 'bg-[#1a7ea5]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${newCategory.isActive ? 'translate-x-4' : ''}`} />
                </div>
                <input
                  type="checkbox"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="hidden"
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Active Pipeline</span>
              </label>

              <button
                onClick={handleAddCategory}
                className="w-full py-5 bg-[#1a7ea5] text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40"
                disabled={!newCategory.name || categoriesLoading}
              >
                {categoriesLoading ? 'Processing...' : editingCategory ? 'Sync Changes' : 'Publish Segment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const ConfirmDeleteDialog = ({ visible, onHide, onConfirm, message }: any) => (
  <Dialog
    visible={visible}
    onHide={onHide}
    header="Danger Zone"
    modal
    className="rounded-[32px] overflow-hidden"
    footer={
      <div className="flex gap-3 justify-end p-4 bg-slate-50/50">
        <button
          onClick={onHide}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
        >
          Retreat
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
        >
          Confirm Strike
        </button>
      </div>
    }
  >
    <div className="p-2">
      <p className="text-sm font-medium text-slate-500 leading-relaxed">{message}</p>
    </div>
  </Dialog>
);

export default CoursesSection;