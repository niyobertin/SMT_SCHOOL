import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Book,
  ChevronDown,
  Crown,
  CheckCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/stores";
import {
  fetchCourses,
  setSearch,
  setPage,
  setCategoryFilter,
} from "../../redux/features/courses/courseSlice";
import { fetchCategories } from "../../redux/features/courses/category";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";


export const CourseList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: courses,
    loading,
    error,
    q,
    page,
    totalPages,
    categoryFilter,
  } = useSelector((state: RootState) => state.courses);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // fetch categories once
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // fetch courses on page/search/category changes
  useEffect(() => {
    dispatch(
      fetchCourses({
        page,
        limit: 1000,
        q,
        categoryId: categoryFilter,
      })
    );
  }, [dispatch, page, q, categoryFilter]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== q) {
        dispatch(setSearch(searchTerm));
        dispatch(
          fetchCourses({
            page: 1,
            limit: itemsPerPage,
            q: searchTerm,
            categoryId: categoryFilter,
          })
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, q, categoryFilter]);

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
        q,
        categoryId: categoryFilter,
      })
    );
  };

  const publishedCourses = courses?.filter((course) => course.isPublished);

  const selectCategory = useCallback(
    (categoryId: string | null) => {
      dispatch(setCategoryFilter(categoryId));
      setDropdownOpen(false);
      dispatch(
        fetchCourses({
          page,
          limit: itemsPerPage,
          q: searchTerm,
          categoryId: categoryId,
        })
      );
    },
    [dispatch, searchTerm, itemsPerPage]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Programs</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Browse through our collection of educational programs and start learning today
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search & Filter Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[200px]">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">
                  {categoryFilter
                    ? categories.find((c) => c.id === categoryFilter)?.name || "Select Category"
                    : "All Categories"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {categoriesLoading ? (
                    <p className="p-2 text-sm text-gray-500">Loading...</p>
                  ) : (
                    <>
                      <button
                        onClick={() => selectCategory(null)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => selectCategory(cat.id)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${categoryFilter === cat.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Programs</p>
              <p className="text-2xl font-bold text-gray-800">{publishedCourses?.length || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Book className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Free Programs</p>
              <p className="text-2xl font-bold text-green-600">{publishedCourses?.filter(c => c.type === 'free').length || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Premium Programs</p>
              <p className="text-2xl font-bold text-amber-600">{publishedCourses?.filter(c => c.type !== 'free').length || 0}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Crown className="text-amber-600" size={20} />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {publishedCourses?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-white/50 text-center">
                <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Book size={40} />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No programs found
                </h2>
                <p className="text-gray-500 max-w-sm">
                  It looks like there aren’t any programs matching your criteria.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {publishedCourses?.map((course: any) => (
                <Link
                  to={`/courses/${course.id}/lessons?subscribed=${course.enrollments?.filter((e: any) => e.status === "ACTIVE")
                    .length > 0
                    }`}
                  key={course.id} // Add key to Link component
                >
                  <div
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100"
                  >


                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                        {course.shortDescription || course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <div className="bg-blue-50 p-1.5 rounded-md">
                            <Book className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{course.lessons?.length || 0} Lessons</span>
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center pb-12 space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-white bg-white shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="text-sm text-gray-700 flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
                  Page <span className="font-semibold">{page} </span> of{" "}
                  <span className="font-semibold"> {totalPages}</span>
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-white bg-white shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="px-3 py-2 border rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="9">9 / page</option>
                  <option value="18">18 / page</option>
                  <option value="27">27 / page</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

