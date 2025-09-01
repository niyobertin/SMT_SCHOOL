import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CourseList } from "./CourseList"
import { fetchCourses } from "../../redux/features/courses/courseSlice"
import type { AppDispatch, RootState } from "../../redux/stores"

export const CoursesPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    q,     
    page,   
    categoryFilter 
  } = useSelector((state: RootState) => state.courses)

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchCourses({ page, q, categoryId: categoryFilter }))
  }, [dispatch, page, q, categoryFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Courses</h1>
          <p className="mt-3 text-xl text-gray-500">
            Browse through our collection of courses and start learning today
          </p>
        </div>

        <CourseList />
      </div>
    </div>
  )
}

export default CoursesPage
