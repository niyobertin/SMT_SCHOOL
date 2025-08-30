"use client"

import React, { useState } from "react"
import { Clock, BookOpen, Star, Play, FileText, ChevronRight } from "lucide-react"

export interface Lesson {
  title: string
  description: string
  type: "video" | "text" | "interactive"
  duration: string
}

interface Course {
  description: string
  duration: string
  rating: number
  lessons: Lesson[]
}

interface CoursesData {
  [category: string]: {
    courses: Record<string, Course>
  }
}

interface Props {
  coursesData: CoursesData
  selectedCategory: string
  selectedCourse: string
}

export const LessonsSection: React.FC<Props> = ({
  coursesData,
  selectedCategory,
  selectedCourse,
}) => {
  const [currentLesson, setCurrentLesson] = useState<number | null>(null)

  const selectLesson = (index: number) => {
    setCurrentLesson(index)
  }

  const course = coursesData[selectedCategory].courses[selectedCourse]
  const lessons = course.lessons

  return (
    <section className="space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">{selectedCourse}</h1>
        <p className="opacity-90">{course.description}</p>
        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen size={16} />
            <span>{lessons.length} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
            <span>{course.rating}</span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border p-5 ${
              currentLesson === index ? "border-blue-400" : "border-gray-100"
            }`}
            onClick={() => selectLesson(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                {/* Lesson Number */}
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {index + 1}
                </div>

                {/* Lesson Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center space-x-1 capitalize">
                      {lesson.type === "video" && <Play size={14} />}
                      {lesson.type === "text" && <FileText size={14} />}
                      {lesson.type === "interactive" && <BookOpen size={14} />}
                      <span>{lesson.type}</span>
                    </span>
                    <span>•</span>
                    <span>{lesson.duration}</span>
                  </div>
                </div>
              </div>

              <ChevronRight size={20} className="text-gray-400" />
            </div>

            {/* Buttons */}
            <div className="mt-4 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Start Learning
              </button>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                Take Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
