"use client"

import { useState } from "react"
// import { Clock, BookOpen, Star, Play, FileText, ChevronRight } from "lucide-react"
import { LessonsSection, type Lesson } from "../../components/Lessons"

// Define the expected course type based on the interface
interface CourseData {
  description: string
  duration: string
  rating: number
  lessons: Lesson[]
}

interface CoursesData {
  [category: string]: {
    courses: Record<string, CourseData>
  }
}

// Mocked data with proper type annotation
const mockedCoursesData: CoursesData = {
  "web-development": {
    courses: {
      "Full Stack Web Development": {
        description: "Learn how to build web applications using modern technologies like React, Node.js, and databases.",
        duration: "6 months",
        rating: 4.8,
        lessons: [
          {
            title: "HTML & CSS Fundamentals",
            description: "Learn the basics of HTML structure and CSS styling.",
            type: "video",
            duration: "30 min",
          },
          {
            title: "JavaScript Essentials",
            description: "Understand JavaScript core concepts and DOM manipulation.",
            type: "video",
            duration: "45 min",
          },
          {
            title: "React Basics",
            description: "Learn how to build interactive UIs using React components.",
            type: "interactive",
            duration: "1h 15 min",
          },
          {
            title: "Node.js & Express",
            description: "Build server-side applications and APIs with Node.js and Express.",
            type: "video",
            duration: "50 min",
          },
          {
            title: "Database Design",
            description: "Learn how to design and manage relational databases.",
            type: "text",
            duration: "40 min",
          },
          {
            title: "Deploying Your App",
            description: "Deploy your web applications to the cloud and learn DevOps basics.",
            type: "video",
            duration: "35 min",
          },
        ],
      },
    },
  },
  "data-science": {
    courses: {
      "Data Science with Python": {
        description: "Learn data analysis, machine learning, and visualization using Python.",
        duration: "8 months",
        rating: 4.9,
        lessons: [
          {
            title: "Python Programming Basics",
            description: "Learn Python syntax, data types, and control flow.",
            type: "video",
            duration: "45 min",
          },
          {
            title: "Data Analysis with Pandas",
            description: "Manipulate and analyze datasets efficiently using Pandas.",
            type: "interactive",
            duration: "1h",
          },
          {
            title: "Data Visualization",
            description: "Create charts and graphs using Matplotlib and Seaborn.",
            type: "video",
            duration: "40 min",
          },
          {
            title: "Machine Learning Fundamentals",
            description: "Learn regression, classification, and clustering algorithms.",
            type: "video",
            duration: "1h 20 min",
          },
        ],
      },
    },
  },
}

// Wrapper component to render the LessonsSection
export const LessonsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("web-development")
  const [selectedCourse, setSelectedCourse] = useState("Full Stack Web Development")

  return (
    <div className="min-h-screen bg-gray-50 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LessonsSection
        coursesData={mockedCoursesData}
        selectedCategory={selectedCategory}
        selectedCourse={selectedCourse}
      />
    </div>
  )
}
