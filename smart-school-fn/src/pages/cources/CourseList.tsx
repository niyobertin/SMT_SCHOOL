import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Book,
  ChevronDown,
  Crown,
  CheckCircle,
  LayoutGrid,
  BookOpen,
  Filter,
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
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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

  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCourses({
        page,
        limit: itemsPerPage,
        q,
        categoryId: categoryFilter,
      })
    );
  }, [dispatch, page, q, categoryFilter, itemsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== q) {
        dispatch(setSearch(searchTerm));
        dispatch(setPage(1));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, q]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(setPage(1));
  };

  const publishedCourses = Array.isArray(courses)
    ? courses.filter((course) => course?.isPublished)
    : [];

  const selectCategory = useCallback(
    (categoryId: string | null) => {
      dispatch(setCategoryFilter(categoryId));
      setDropdownOpen(false);
      dispatch(setPage(1));
    },
    [dispatch]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-12 bg-red-50 rounded-3xl border border-red-100 max-w-md">
          <p className="text-red-900 font-semibold uppercase tracking-tight mb-2">Error Loading Programs</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Minimal Hero Header */}
      <div className="bg-slate-50 py-8 lg:py-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a7ea5]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6cb9cc]/5 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-tight">
              Educational Programs
            </h1>
            <div className="w-16 h-1 bg-[#1a7ea5] mx-auto mb-8 rounded-full" />
            <p className="hidden md:block text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Explore our comprehensive curriculum designed to empower your professional development and academic success.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Search & Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Search Input */}
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a7ea5] w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-semibold text-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full md:w-72" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-between w-full px-8 py-5 bg-white border-2 border-slate-50 rounded-full text-slate-700 hover:border-[#6cb9cc] transition-all focus:outline-none font-bold tracking-widest text-[11px]"
              >
                <div className="flex items-center gap-3">
                  <Filter size={16} className="text-[#1a7ea5]" />
                  <span className="whitespace-nowrap">
                    {categoryFilter
                      ? categories.find((c) => c.id === categoryFilter)?.name
                      : "All Categories"}
                  </span>
                </div>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 mt-3 w-full bg-white border border-slate-100 rounded-3xl overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide font-semibold text-[13px]">
                      <button
                        onClick={() => selectCategory(null)}
                        className={`w-full text-left px-6 py-4 rounded-2xl transition-colors mb-1 ${!categoryFilter ? 'bg-[#1a7ea5] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => selectCategory(cat.id)}
                          className={`w-full text-left px-6 py-4 rounded-2xl transition-colors mb-1 ${categoryFilter === cat.id ? 'bg-[#1a7ea5] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(itemsPerPage)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {publishedCourses?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-center"
                >
                  <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-3xl bg-white border border-slate-100">
                    <BookOpen className="w-10 h-10 text-slate-200" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                    No courses found
                  </h2>
                  <p className="text-slate-500 max-w-sm font-medium">
                    We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publishedCourses?.map((course: any, idx) => {
                    const isSubscribed = course.enrollments?.filter((e: any) => e.status === "ACTIVE").length > 0;
                    return (
                      <motion.div
                        layout
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          to={`/courses/${course.id}/lessons?subscribed=${isSubscribed}`}
                          className="group block bg-white rounded-3xl transition-all duration-500 border border-slate-200 overflow-hidden h-full flex flex-col"
                        >
                          <div className="p-6 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-6">
                              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${course.type === "free" ? "bg-green-50 text-green-600 border border-green-100" : "bg-[#6cb9cc]/10 text-[#1a7ea5] border border-[#6cb9cc]/20"}`}>
                                {course.type}
                              </div>
                              {isSubscribed ? (
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                  <CheckCircle size={18} />
                                </div>
                              ) : course.type !== "free" && (
                                <div className="w-8 h-8 bg-[#1a7ea5] text-white rounded-full flex items-center justify-center">
                                  <Crown size={16} />
                                </div>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors mb-4 tracking-tight leading-tight">
                              {course.title.charAt(0).toUpperCase() + course.title.slice(1).toLowerCase()}
                            </h3>

                            <div className="flex flex-wrap gap-4 items-center mb-6">
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <Book size={14} className="text-[#1a7ea5]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{course.lessons?.length || 0} Lessons</span>
                              </div>
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <LayoutGrid size={14} className="text-[#1a7ea5]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{course.tests?.length || 0} Tests</span>
                              </div>
                            </div>

                            <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-6">
                              {course.shortDescription || course.description}
                            </p>
                          </div>

                          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#1a7ea5] rounded-xl flex items-center justify-center text-white font-bold text-xs">
                                {course.instructor?.firstName?.charAt(0)}{course.instructor?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Instructor</p>
                                <p className="text-xs font-semibold text-slate-700">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a7ea5]">
                              {course.createdAt ? formatDistanceToNow(new Date(course.createdAt), { addSuffix: true }) : ''}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4 order-2 sm:order-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Show</p>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="bg-slate-50 border-none rounded-full px-4 py-2 text-xs font-bold text-[#1a7ea5] focus:ring-2 focus:ring-[#1a7ea5]/20"
                  >
                    {[9, 18, 27, 36, 45].map(val => (
                      <option key={val} value={val}>{val} per page</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-[#1a7ea5] hover:text-[#1a7ea5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[.2em] text-slate-400">Page</span>
                    <span className="w-10 h-10 bg-[#1a7ea5] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                      {page}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[.2em] text-slate-400">of</span>
                    <span className="text-sm font-bold text-slate-900 uppercase">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-[#1a7ea5] hover:text-[#1a7ea5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div >
  );
};
