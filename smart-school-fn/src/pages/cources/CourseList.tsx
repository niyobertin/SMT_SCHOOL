import { useState, useEffect, useCallback } from "react"
import { Search, ChevronLeft, ChevronRight, Eye, Book } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import type { AppDispatch, RootState } from "../../redux/stores"
import { fetchCourses, setSearch, setPage, setCategoryFilter } from "../../redux/features/courses/courseSlice"
import { fetchCategories } from "../../redux/features/courses/category"
import { CourseCardSkeleton, CategoryFilterSkeleton } from "../../components/Skeletons/CourseCardSkeleton"
import { formatDistanceToNow } from "date-fns";
export const CourseList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    items: courses,
    loading,
    error,
    q,
    page,
    totalPages,
    categoryFilter
  } = useSelector((state: RootState) => state.courses)

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== q) {
        dispatch(setSearch(searchTerm))
        dispatch(fetchCourses({
          page: 1,
          q: searchTerm,
          categoryId: categoryFilter
        }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, dispatch, q, categoryFilter])

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100 }))
    dispatch(fetchCourses({ page, q, categoryId: categoryFilter }))
  }, [dispatch, page, q, categoryFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const applyFilters = useCallback(() => {
    dispatch(setCategoryFilter(selectedCategories[0] || null))
    setShowFilters(false)
  }, [dispatch, selectedCategories])

  const clearFilters = useCallback(() => {
    setSelectedCategories([])
    dispatch(setCategoryFilter(null))
    dispatch(setSearch(""))
    setSearchTerm("")
  }, [dispatch])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden text-blue-600"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Categories</h4>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {categoriesLoading ? (
                  <CategoryFilterSkeleton />
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories?.map((category) => (
                      <label key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategoryFilter(category.id)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={applyFilters}
                className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={selectedCategories.length === 0}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              {categoryFilter
                ? `Courses in ${categories.find(c => c.id === categoryFilter)?.name || 'Selected Category'}`
                : 'All Courses'}
              {categoryFilter && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-sm text-blue-600 hover:underline"
                >
                  (Clear filter)
                </button>
              )}
            </h2>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {courses?.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        {course.level}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex space-x-4 items-center mb-2 bg-gray-100 px-2 py-1 rounded-md w-fit">
                        <span className="text-sm text-gray-700 font-medium">{course.tests?.length || 0} <Book className="inline mr-1 h-4 w-4" />Tests</span>
                        <span className="text-sm text-gray-700 font-medium">{course.lessons?.length || 0} <Book className="inline mr-1 h-4 w-4" />Lessons</span>
                      </div>
                      <p className="text-sm text-black font-medium mb-4">
                        {course.createdAt
                          ? `Posted : ${formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}`
                          : "No date"}.<span className="text-sm text-gray-600">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.shortDescription || course.description}</p>
                      <div className="flex justify-between items-center">
                        <Link
                          to={`/courses/${course.id}/lessons`}
                          className="flex items-center text-white hover:text-blue-800 text-sm font-medium bg-green-500 px-2 py-1 rounded"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Lessons
                        </Link>
                        <Link
                          to={`/courses/${course.id}/lessons`}
                          className="flex items-center text-white hover:text-blue-800 text-sm font-medium bg-blue-500 px-2 py-1 rounded"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Tests
                        </Link>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border rounded-md ${page === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
