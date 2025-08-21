import { Users, Star, Clock, Award, Video, Badge } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import useLanguage from "../hooks/useLanguage"

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
}

// Mock featured courses data
const featuredCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Dr. Angela Yu",
    price: "$89.99",
    originalPrice: "$199.99",
    rating: 4.8,
    students: 12543,
    duration: "65 hours",
    thumbnail: "/web-dev-course.png",
    level: "Beginner to Advanced",
  },
  {
    id: 2,
    title: "Data Science and Machine Learning",
    instructor: "Jose Portilla",
    price: "$79.99",
    originalPrice: "$179.99",
    rating: 4.9,
    students: 8932,
    duration: "42 hours",
    thumbnail: "/data-science-course.png",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    instructor: "Phil Ebiner",
    price: "$69.99",
    originalPrice: "$149.99",
    rating: 4.7,
    students: 15678,
    duration: "28 hours",
    thumbnail: "/marketing-course.png",
    level: "Beginner",
  },
]

export const HomePage: React.FC = () => {
  const { t } = useLanguage()

  return (
    <>
      {/* Hero Section */}
      <motion.section
        className="relative py-20 lg:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        custom={0}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {t("transformYourFuture")}
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">{t("homeSubtitle")}</p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link to="/auth/register">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                  {t("getStarted")}
                </button>
              </Link>
              <Link to="/courses">
                <button className="text-lg px-8 py-3 bg-transparent">
                  {t("exploreCourses")}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("whyChooseUs")}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[Video, Users, Clock, Award].map((Icon, i) => (
              <motion.div
                key={i}
                className="text-center p-6 hover:shadow-lg transition-shadow rounded-xl"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl mb-2">{t("featureTitle" + i)}</h2>
                <p className="text-slate-600">{t("featureDesc" + i)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("featuredCourses")}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                className="overflow-hidden hover:shadow-xl transition-shadow rounded-xl bg-white"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="relative">
                  <motion.img
                    src={course.thumbnail || `/placeholder.png`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500">
                    55% {t("off")}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      ({course.students.toLocaleString()} {t("enrolledStudents")})
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    {t("by")} {course.instructor}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <Badge>{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">{course.price}</span>
                      <span className="text-sm text-slate-500 line-through">{course.originalPrice}</span>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {t("enrollNow")}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("readyToStart")}</h2>
          <p className="text-xl text-blue-100 mb-8">{t("joinThousands")}</p>
          <Link to="/auth/register">
            <motion.button
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("getStarted")}
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </>
  )
}
