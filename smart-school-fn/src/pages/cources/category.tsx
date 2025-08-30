import { useState } from "react"
import { ArrowRight, CheckCircle, Search } from "lucide-react"
import useLanguage from "../../hooks/useLanguage"
import { Link } from "react-router-dom"

export const CourseCategories = () => {
  const { t } = useLanguage()

  const categories = [
    {
      id: "1",
      slug: "web-development",
      title: t("webDevelopment"),
      description: t("webDevDesc"),
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
      slug: "data-science",
      title: t("dataScience"),
      description: t("dataScienceDesc"),
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
      slug: "digital-marketing",
      title: t("digitalMarketing"),
      description: t("digitalMarketingDesc"),
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

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Handle filter toggle
  const handleFilterChange = (slug: string) => {
    setSelectedFilters((prev) =>
      prev.includes(slug) ? prev.filter((f) => f !== slug) : [...prev, slug]
    )
  }

  // Apply search & filter
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      selectedFilters.length === 0 || selectedFilters.includes(cat.slug)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="bg-slate-50">
    <div className="min-h-screen py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">{t("ourPrograms")}</h1>
        <p className="text-lg text-gray-600 mt-4">{t("programsSubtitle")}</p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
        <div className="relative w-full lg:w-1/3 py-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
            type="text"
            placeholder="Search course categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 bg-white rounded-lg pl-10 pr-4 py-2 shadow-sm focus:outline-none"
            />
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat) => {
              const firstFour = cat.lessons.slice(0, 4)
              const remaining = cat.lessons.length - 4

              return (
                <div
                  key={cat.id}
                  className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">{cat.description}</p>

                  <ul className="space-y-2 mb-4">
                    {firstFour.map((lesson, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {lesson}
                      </li>
                    ))}
                  </ul>

                  {remaining > 0 && (
                    <p className="text-sm text-gray-500 mb-4">+{remaining} More</p>
                  )}

                  <Link
                    to={`/courses/${cat.slug}`}
                    className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {t("exploreCourses")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          {filteredCategories.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No results</p>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
