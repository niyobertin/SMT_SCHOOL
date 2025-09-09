import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup";
import { createCourse } from "../../redux/features/courses/courseSlice";
import { fetchCategories, createCategory } from "../../redux/features/courses/category";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/stores";
import { courseSchema } from "../../schema/courseScema";
import { Toast } from "primereact/toast";

interface CourseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
export const CourseForm = ({ open, onClose, onSuccess }: CourseFormProps) => {
  const toast = useRef<Toast>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: null as File | null,
    language: "English",
    level: "BEGINNER",
    status: "DRAFT",
    isPublished: false,
    isFeatured: false,
    tags: [] as string[],
    requirements: [] as string[],
    objectives: [] as string[],
    categoryId: "",
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    setIsVisible(open);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const validateField = async (field: string, value: any) => {
    try {
      await courseSchema.validateAt(field, { [field]: value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [field]: error.message }));
      }
    }
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = "checked" in target ? target.checked : false;

    setCourseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    await validateField(name, type === "checkbox" ? checked : value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseData((prev) => ({
        ...prev,
        thumbnail: e.target.files![0],
      }));
    }
  };

  const handleSubmitCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await courseSchema.validate(courseData, { abortEarly: false });

      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("shortDescription", courseData.shortDescription);
      formData.append("language", courseData.language);
      formData.append("level", courseData.level);
      formData.append("status", courseData.status);
      formData.append("isPublished", String(courseData.isPublished));
      formData.append("isFeatured", String(courseData.isFeatured));
      formData.append("categoryId", courseData.categoryId);

      if (courseData.thumbnail) {
        formData.append("thumbnail", courseData.thumbnail);
      }
      courseData.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
      courseData.requirements.forEach((req, i) =>
        formData.append(`requirements[${i}]`, req)
      );
      courseData.objectives.forEach((obj, i) =>
        formData.append(`objectives[${i}]`, obj)
      );
      setCourseLoading(true);
      await dispatch(createCourse(formData)).unwrap();
      toast.current?.show({
        severity: "success",
        summary: "Course Created",
        detail: "Course created successfully!",
        life: 3000,
      });
      setCourseLoading(false);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error:", error);

      if (error instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Course Failed",
          detail: "Course failed to create!",
          life: 3000,
        });
      }
    }
  };


  const handleAddCategory = async () => {
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
    } catch (error:any) {
      console.error('Failed to create category:', error);
      toast.current?.show({
        severity: "error",
        summary: "Category Failed",
        detail: "Category failed to create!",
        life: 3000,
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-700/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">Add New Course</h2>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmitCourse} className="space-y-4">
                  <div className="lg:flex gap-4">
                    {/* Title */}
                    <input
                      type="text"
                      name="title"
                      placeholder="Course Title"
                      value={courseData.title}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.title ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}

                    {/* Short Description */}
                    <input
                      type="text"
                      name="shortDescription"
                      placeholder="Short Description"
                      value={courseData.shortDescription}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.shortDescription ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
                  </div>

                  {/* Description */}
                  <textarea
                    name="description"
                    placeholder="Full Description"
                    value={courseData.description}
                    onChange={handleChange}
                    className={`w-full border rounded-lg p-2 mb-2 ${errors.description ? 'border-red-500' : ''}`}
                    rows={4}
                    required
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}

                  <div className="lg:flex gap-4">
                    {/* Thumbnail */}
                    <input
                      type="file"
                      name="thumbnail"
                      placeholder=""
                      onChange={handleFileChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.thumbnail ? 'border-red-500' : ''}`}
                    />
                    {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}

                    {/* Language */}
                    <select
                      name="language"
                      value={courseData.language}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.language ? 'border-red-500' : ''}`}
                    >
                      <option>English</option>
                      <option>French</option>
                      <option>Kinyarwanda</option>
                    </select>
                    {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
                  </div>

                  <div className="lg:flex gap-4">
                    {/* Level */}
                    <select
                      name="level"
                      value={courseData.level}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.level ? 'border-red-500' : ''}`}
                    >
                      <option>BEGINNER</option>
                      <option>INTERMEDIATE</option>
                      <option>ADVANCED</option>
                      <option>EXPERT</option>
                    </select>
                    {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}

                    {/* Status */}
                    <select
                      name="status"
                      value={courseData.status}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mb-2 ${errors.status ? 'border-red-500' : ''}`}
                    >
                      <option>DRAFT</option>
                      <option>PUBLISHED</option>
                      <option>ARCHIVED</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <div className="flex gap-2">
                      {categoriesLoading ? (
                        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      ) : (
                        <>
                          <select
                            name="categoryId"
                            value={courseData.categoryId}
                            onChange={handleChange}
                            className={`flex-1 border rounded-lg p-2 mb-2 ${errors.categoryId ? 'border-red-500' : ''}`}
                            required
                            disabled={categoriesLoading}
                          >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        disabled={categoriesLoading}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Booleans */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={courseData.isPublished}
                      onChange={handleChange}
                    />
                    Published
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={courseData.isFeatured}
                      onChange={handleChange}
                    />
                    Featured
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={courseLoading}
                  >
                    {courseLoading ? 'Saving...' : 'Save Course'}
                  </button>
                </form>

                {/* Category Modal */}
                {showCategoryModal && (
                  <div className="fixed inset-0 bg-gray-700/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
                      <button
                        onClick={() => setShowCategoryModal(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        disabled={categoriesLoading}
                      >
                        <X size={20} />
                      </button>
                      <h3 className="text-xl font-bold mb-4">Add New Category</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Category Name"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full border rounded-lg p-2"
                          disabled={categoriesLoading}
                        />
                        <textarea
                          placeholder="Description"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                          }
                          className="w-full border rounded-lg p-2"
                          disabled={categoriesLoading}
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newCategory.isActive}
                            onChange={(e) =>
                              setNewCategory((prev) => ({ ...prev, isActive: e.target.checked }))
                            }
                            disabled={categoriesLoading}
                          />
                          Active
                        </label>
                        <button
                          onClick={handleAddCategory}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          disabled={!newCategory.name || categoriesLoading}
                        >
                          {categoriesLoading ? 'Saving...' : 'Save Category'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Toast ref={toast} position="top-right" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseForm;
