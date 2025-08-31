import { useState, useEffect } from "react"
import { ArrowRight, CheckCircle, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchCategories, setSearch, setPage } from "../../redux/features/courses/category"
import useLanguage from "../../hooks/useLanguage"
import type { AppDispatch, RootState } from "../../redux/stores"

export const CourseCategories = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch<AppDispatch>()
  const { 
    items: categories, 
    loading, 
    error, 
    search,
    page,
    totalPages,
    total
  } = useSelector((state: RootState) => state.categories)

  const [searchTerm, setSearchTerm] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== search) {
        dispatch(setSearch(searchTerm));
        dispatch(fetchCategories({ page: 1, search: searchTerm }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, search]);

  useEffect(() => {
    dispatch(fetchCategories({ page, search: searchTerm }));
  }, [page, dispatch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading && !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{t("ourPrograms")}</h1>
          <p className="text-lg text-gray-600 mt-4">
            Showing {categories.length} of {total} categories
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="relative w-full lg:w-1/3 mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded-lg pl-10 pr-4 py-2 shadow-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h2>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                  {category.courses?.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {category.courses.slice(0, 4).map((course: any, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{course.title}</span>
                        </li>
                      ))}
                      {category.courses.length > 4 && (
                        <li className="text-sm text-gray-500">
                          + {category.courses.length - 4} more courses
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <Link
                      to={`/courses/category/${category.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View Courses
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
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
                      className={`px-4 py-2 border rounded-md ${
                        page === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
