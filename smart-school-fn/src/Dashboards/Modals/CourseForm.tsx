import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup";
import { createCourse, updateCourse } from "../../redux/features/courses/courseSlice";
import { fetchCategories, createCategory } from "../../redux/features/courses/category";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/stores";
import { courseSchema } from "../../schema/courseScema";
import { Toast } from "primereact/toast";

interface CourseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: any;
}

export const CourseForm = ({ open, onClose, onSuccess, course }: CourseFormProps) => {
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

  // Initialize form with course data when in edit mode
  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title || "",
        description: course.description || "",
        shortDescription: course.shortDescription || "",
        thumbnail: course.thumbnail || null,
        language: course.language || "English",
        level: course.level || "BEGINNER",
        status: course.status || "DRAFT",
        isPublished: course.isPublished || false,
        isFeatured: course.isFeatured || false,
        tags: course.tags || [],
        requirements: course.requirements || [],
        objectives: course.objectives || [],
        categoryId: course.categoryId || "",
      });
    } else {
      // Reset form when creating a new course
      setCourseData({
        title: "",
        description: "",
        shortDescription: "",
        thumbnail: null,
        language: "English",
        level: "BEGINNER",
        status: "DRAFT",
        isPublished: false,
        isFeatured: false,
        tags: [],
        requirements: [],
        objectives: [],
        categoryId: "",
      });
    }
  }, [course, open]);

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseLoading(true);

    try {
      // Validate form data
      await courseSchema.validate(courseData, { abortEarly: false });

      const formData = new FormData();

      // Append all fields to formData
      Object.entries(courseData).forEach(([key, value]) => {
        if (key === "thumbnail") {
          if (value instanceof File) {
            formData.append("thumbnail", value);
          }
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });

      if (course) {
        // Update existing course
        await dispatch(updateCourse({
          courseId: course.id, courseData: formData,
        })).unwrap();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Course updated successfully',
          life: 3000
        });
      } else {
        // Create new course
        await dispatch(createCourse(formData)).unwrap();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Course created successfully',
          life: 3000
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.inner) {
        // Yup validation errors
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // API errors
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'An error occurred',
          life: 3000
        });
      }
    } finally {
      setCourseLoading(false);
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
    } catch (error: any) {
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
      {open && (
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
            className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {course ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="lg:flex gap-4">
                  {/* Title */}
                  <div className="flex-1">
                    <label htmlFor="title" className="block mb-1 font-medium">Title</label>
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
                  </div>

                  {/* Short Description */}
                  <div className="flex-1">
                    <label htmlFor="shortDescription" className="block mb-1 font-medium">Short Description</label>
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
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block mb-1 font-medium">Description</label>
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
                </div>
                <div className="lg:flex gap-4">
                  {/* <div className="flex-1">
                  <label htmlFor="thumbnail" className="block mb-1 font-medium">Cover Image</label>
                  <input
                    type="file"
                    name="thumbnail"
                    placeholder=""
                    onChange={handleFileChange}
                    className={`w-full border rounded-lg p-2 mb-2 ${errors.thumbnail ? 'border-red-500' : ''}`}
                  />
                  {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                  </div> */}

                  {/* Language */}
                  <div className="flex-1">
                    <label htmlFor="language" className="block mb-1 font-medium">Language</label>
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
                </div>

                <div className="lg:flex gap-4">
                  {/* Level */}
                  <div className="flex-1">
                    <label htmlFor="level" className="block mb-1 font-medium">Level</label>
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
                  </div>

                  {/* Status */}
                  <div className="flex-1">
                    <label htmlFor="status" className="block mb-1 font-medium">Status</label>
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
                </div>
                {/* Category Selector */}
                <div>
                  <label htmlFor="categoryId" className="block mb-1 font-medium">Category</label>
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
                          {categories
                            .filter((cat) => cat.isActive)
                            .map((cat) => (
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

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={courseLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={courseLoading}
                  >
                    {courseLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {course ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : course ? (
                      'Update Course'
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>
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
          </motion.div>
        </motion.div>
      )}
      <Toast ref={toast} position="top-right" />
    </AnimatePresence>
  );
};

export default CourseForm;
