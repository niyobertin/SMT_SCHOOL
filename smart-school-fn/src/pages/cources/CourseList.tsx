import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Book, ChevronDown, Crown, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/stores";
import {
  fetchCourses,
  setSearch,
  setPage,
  setCategoryFilter
} from "../../redux/features/courses/courseSlice";
import { fetchCategories } from "../../redux/features/courses/category";
import { CourseCardSkeleton } from "../../components/Skeletons/CourseCardSkeleton";
import { formatDistanceToNow } from "date-fns";

export const CourseList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: courses,
    loading,
    error,
    q,
    page,
    totalPages,
    categoryFilter
  } = useSelector((state: RootState) => state.courses);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // fetch categories once
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // fetch courses on page/search/category changes
  useEffect(() => {
    dispatch(
      fetchCourses({
        page,
        q,
        categoryId: categoryFilter
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
            q: searchTerm,
            categoryId: categoryFilter
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

  const selectCategory = useCallback(
    (categoryId: string | null) => {
      dispatch(setCategoryFilter(categoryId));
      setDropdownOpen(false);
      dispatch(
        fetchCourses({
          page: 1,
          q: searchTerm,
          categoryId: categoryId
        })
      );
    },
    [dispatch, searchTerm]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar: Search + Category Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {categoryFilter
            ? `Courses in ${categories.find(c => c.id === categoryFilter)?.name || "Selected"
            }`
            : "All Courses"}
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center justify-between w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categoryFilter
                ? categories.find(c => c.id === categoryFilter)?.name || "Select Category"
                : "All Categories"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${categoryFilter === cat.id ? "bg-gray-100 font-medium" : ""
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

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {courses?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center shadow-sm">
              <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No courses found
              </h2>
              <p className="text-gray-500 max-w-sm">
                It looks like there aren’t any courses available at the moment.
                Check back later
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map(course => (
              <Link
                to={`/courses/${course.id}/lessons`}
              >
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {course.enrollments?.length > 0 ? (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full shadow-md">
                        <Crown className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <div className="flex space-x-4 items-center mb-2 bg-gray-100 px-2 py-1 rounded-md w-fit">
                      <span className="text-sm text-gray-700 font-medium">
                        {course.tests?.length || 0}{" "}
                        <Book className="inline mr-1 h-4 w-4" />
                        Tests
                      </span>
                      <span className="text-sm text-gray-700 font-medium">
                        {course.lessons?.length || 0}{" "}
                        <Book className="inline mr-1 h-4 w-4" />
                        Lessons
                      </span>
                    </div>
                    <p className="text-sm text-black font-medium mb-4">
                      {course.createdAt
                        ? `Posted : ${formatDistanceToNow(new Date(course.createdAt), {
                          addSuffix: true
                        })}`
                        : "No date"}
                      .{" "}
                      <span className="text-sm text-gray-600">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-sm text-black flex items-center justify-between gap-2">
                Page <span className="font-semibold">{page} </span> of <span className="font-semibold"> {totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>


            </div>
          )}

        </>
      )}
    </div>
  );
};
