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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CourseList />
      </div>
    </div>
  )
}

export default CoursesPage
