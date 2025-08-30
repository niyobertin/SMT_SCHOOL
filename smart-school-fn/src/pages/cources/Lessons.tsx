import { useState } from "react"
import { Menu, X, CheckCircle } from "lucide-react"

const categories = [
  {
    id: "1",
    title: "Web Development",
    lessons: [
      "HTML, CSS, JavaScript Fundamentals",
      "React & Next.js Development",
      "Node.js & Express Backend",
      "Database Design & Management",
      "API Development & Integration",
      "Deployment & DevOps Basics",
    ],
  },
  {
    id: "2",
    title: "Data Science",
    lessons: [
      "Python Programming Mastery",
      "Data Analysis with Pandas",
      "Machine Learning Algorithms",
      "Deep Learning & Neural Networks",
      "Data Visualization",
      "Real-world Project Portfolio",
    ],
  },
  {
    id: "3",
    title: "Digital Marketing",
    lessons: [
      "SEO & Content Marketing",
      "Social Media Strategy",
      "Google Ads & Facebook Ads",
      "Email Marketing Automation",
      "Analytics & Performance Tracking",
      "Brand Building & Strategy",
    ],
  },
]

export const LessonsByCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full bg-white shadow-md lg:shadow-none z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 w-64`}
      >
        <div className="p-4 border-b flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold">Categories</h2>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <ul className="p-4 space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`cursor-pointer px-3 py-2 rounded-lg ${
                selectedCategory.id === cat.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                setSelectedCategory(cat)
                setIsSidebarOpen(false)
              }}
            >
              {cat.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="flex-1 p-6 lg:ml-0">
        <h1 className="text-2xl font-bold mb-4">{selectedCategory.title}</h1>
        <ul className="space-y-3">
          {selectedCategory.lessons.map((lesson, idx) => (
            <li key={idx} className="flex items-center text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              {lesson}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
