import { X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from 'primereact/toast';
import { motion, AnimatePresence } from "framer-motion";
import { createCourse, updateCourse } from "../../redux/features/courses/courseSlice";
import { fetchCategories, createCategory } from "../../redux/features/courses/category";
import type { AppDispatch, RootState } from "../../redux/stores";

interface CourseFormProps {
  course?: any;
  onClose: () => void;
  onSuccess?: () => void;
  open?: boolean;
}

export const CourseForm = ({ course, onClose, onSuccess }: CourseFormProps) => {
  const [courseData, setCourseData] = useState({
    title: course?.title || '',
    shortDescription: course?.shortDescription || '',
    description: course?.description || '',
    language: course?.language || 'English',
    level: course?.level || 'BEGINNER',
    status: course?.status || 'DRAFT',
    type: course?.type || 'Free',
    categoryId: course?.categoryId || '',
    isPublished: course?.isPublished || false,
    isFeatured: course?.isFeatured || false,
    thumbnail: null as File | null,
  });

  const [errors, setErrors] = useState<any>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const dispatch = useDispatch<AppDispatch>();
  const toast = useRef<Toast>(null);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { loading: courseLoading } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setCourseData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseData((prev) => ({
        ...prev,
        thumbnail: e.target.files![0],
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!courseData.title) newErrors.title = 'Title is required';
    if (!courseData.shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!courseData.description) newErrors.description = 'Description is required';
    if (!courseData.categoryId) newErrors.categoryId = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.keys(courseData).forEach((key) => {
      if (key === 'thumbnail' && courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      } else if (key !== 'thumbnail') {
        formData.append(key, (courseData as any)[key]);
      }
    });

    try {
      if (course) {
        await dispatch(updateCourse({ courseId: course.id, courseData: formData })).unwrap();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Course updated successfully',
        });
      } else {
        await dispatch(createCourse(formData)).unwrap();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Course created successfully',
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Something went wrong',
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    try {
      await dispatch(createCategory(newCategory)).unwrap();
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Category added successfully',
      });
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '', isActive: true });
      dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to add category',
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-700/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="lg:flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Course Title"
                    value={courseData.title}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all ${errors.title ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.title}</p>}
                </div>

                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Short Description</label>
                  <input
                    type="text"
                    name="shortDescription"
                    placeholder="Short Description"
                    value={courseData.shortDescription}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all ${errors.shortDescription ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.shortDescription && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.shortDescription}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Full Description"
                  value={courseData.description}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all ${errors.description ? 'ring-2 ring-red-500' : ''}`}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.description}</p>}
              </div>

              <div className="lg:flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Language</label>
                  <select
                    name="language"
                    value={courseData.language}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Kinyarwanda</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Level</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                  >
                    <option>BEGINNER</option>
                    <option>INTERMEDIATE</option>
                    <option>ADVANCED</option>
                    <option>EXPERT</option>
                  </select>
                </div>
              </div>

              <div className="lg:flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Status</label>
                  <select
                    name="status"
                    value={courseData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                  >
                    <option>DRAFT</option>
                    <option>PUBLISHED</option>
                    <option>ARCHIVED</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type</label>
                  <select
                    name="type"
                    value={courseData.type}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                  >
                    <option>Free</option>
                    <option>Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={courseData.categoryId}
                    onChange={handleChange}
                    className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all ${errors.categoryId ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((cat) => cat.isActive)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-5 py-2.5 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 disabled:opacity-50"
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'New'
                    )}
                  </button>
                </div>
                {errors.categoryId && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Cover Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all font-bold disabled:opacity-50"
                  disabled={courseLoading}
                >
                  {courseLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Cancel
                    </span>
                  ) : (
                    'Cancel'
                  )}
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 disabled:opacity-50"
                  disabled={courseLoading}
                >
                  {courseLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </span>
                  ) : course ? (
                    'Update Course'
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>

            {showCategoryModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add New Category</h3>
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={categoriesLoading}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Mathematics"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                        disabled={categoriesLoading}
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
                      <textarea
                        placeholder="Category purpose..."
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                        rows={3}
                        disabled={categoriesLoading}
                      />
                    </div>
                    <button
                      onClick={handleAddCategory}
                      className="w-full py-3.5 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all disabled:opacity-50 mt-4 font-bold"
                      disabled={!newCategory.name || categoriesLoading}
                    >
                      {categoriesLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Category'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <Toast ref={toast} position="top-right" />
    </AnimatePresence>
  );
};

export default CourseForm;
