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

  return <CourseList />
}

export default CoursesPage
