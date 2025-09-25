import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Eye, Calendar, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteCourse, fetchCourses } from "../../redux/features/courses/courseSlice";
import { CourseForm } from "../Modals/CourseForm";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { fetchCategories, createCategory } from "../../redux/features/courses/category";
import api from "../../redux/api/api";


interface CoursesSectionProps { }

export const CoursesSection = ({ }: CoursesSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "categories">("courses");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const itemsPerPage = 6;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useRef<Toast>(null);

  const {
    items: courses,
    loading,
    error,
  } = useSelector((state: RootState) => state.courses);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

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

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Course deleted successfully',
        life: 3000
      });
      dispatch(fetchCourses({
        page: currentPage,
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
    // Refresh courses
    dispatch(fetchCourses({
      page: currentPage,
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

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000, search: "" }));
  }, [dispatch]);

  const handleAddCategory = async () => {
    if (editingCategory) {
      try {
        await api.patch(`/categories/${editingCategory.id}`, newCategory);
        dispatch(fetchCategories({ page: currentPage, limit: itemsPerPage }));
        toast.current?.show({
          severity: "success",
          summary: "Category Updated",
          detail: "Category updated successfully!",
          life: 3000,
        });
        setShowCategoryModal(false);
      } catch (error: any) {
        console.error('Failed to update category:', error);
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
      } catch (error: any) {
        console.error('Failed to create category:', error);
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
  const confirmDeleteCategory = () => {
    api.delete(`/categories/${categoryToDelete}`);
    dispatch(fetchCategories({ page: currentPage, limit: itemsPerPage }));
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Category deleted successfully',
      life: 3000
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (description: string, maxLength = 80) => {
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
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
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === "courses" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === "categories" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>
      {activeTab === "courses" ? (
        <>
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
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* <div className="h-48 bg-gray-200 relative">
                  {course?.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div> */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course?.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course?.description || 'No description available.'}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500 ">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer bg-green-500 text-white p-2 rounded"
                        >
                          <Eye size={16} />
                          View {course?.lessons?.length || 0} Lessons
                        </button>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCourse(course.id);
                            }}
                            className="flex items-center gap-1 hover:text-yellow-800 cursor-pointer bg-indigo-500 text-white p-2 rounded"
                            title="Edit course"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(course.id);
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 cursor-pointer bg-red-500 text-white p-2 rounded"
                            title="Delete course"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(
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
        </>
      ) :
        (
          <div className="bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  Categories Management
                </h2>
                <p className="text-gray-700 mt-1">Manage your course categories and track course counts</p>
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {truncateDescription(category.description)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">
                              {category.courses?.length || 0} course{category.courses?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(category.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openModal(category)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                              title="Update Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCategoryDeleteClick(category.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                        {categoriesLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                      onClick={confirmDeleteCategory}
                      autoFocus
                      className="p-button-danger"
                    />
                  </div>
                }
              >
                <p>Are you sure you want to delete this category? This action cannot be undone.</p>
              </Dialog>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{categories.length}</span> of{' '}
                    <span className="font-medium">{categories.length}</span> categories
                  </div>
                  <div className="text-sm text-gray-500">
                    Total courses: <span className="font-medium">
                      {categories.reduce((total, category) => total + (category.courses?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CoursesSection;