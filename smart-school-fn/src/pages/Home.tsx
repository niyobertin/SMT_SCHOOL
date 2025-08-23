import { Users, Clock, Award, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useLanguage from "../hooks/useLanguage";
import { FeatureCard } from "../components/FeatureCard";
import backgroundImage from "../assets/background.jpg";
import { ourPrograms } from "../constants/programs";
import { fadeInUp } from "../constants/animation";

export const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero Section */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="relative py-20 lg:py-32 h-screen flex items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        custom={0}
      >
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {t("transformYourFuture")}
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              {t("homeSubtitle")}
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 font-medium justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link to="/register">
                <button className="bg-[#19459d] text-white text-lg rounded-full px-8 py-3">
                  {t("getStarted")}
                </button>
              </Link>
              <Link to="/courses">
                <button className="text-lg px-8 py-3 bg-white text-black rounded-full">
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("whyChooseUs")}{" "}
              <span className="text-[#19459d]"> Smart School?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Video,
                title: t("multiFormatLearning"),
                description: t("multiFormatDesc"),
              },
              {
                icon: Users,
                title: t("expertInstructors"),
                description: t("expertInstructorsDesc"),
              },
              {
                icon: Clock,
                title: t("flexibleSchedule"),
                description: t("flexibleScheduleDesc"),
              },
              {
                icon: Award,
                title: t("certifiedLearning"),
                description: t("certifiedLearningDesc"),
              },
            ].map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
                fadeInUp={fadeInUp}
              />
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("featuredCourses")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ourPrograms.map((program, i) => (
              <motion.div
                key={program.id}
                className="overflow-hidden hover:shadow-xl transition-shadow rounded-xl bg-white"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {program.title}
                  </h3>
                  <div className="flex items-center gap-4 text-lg text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      {program.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button className="bg-[#19459d] text-white px-4 py-2 rounded-full text-sm hover:bg-[#153d7a] transition">
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
        className="py-20 bg-[#19459d] text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 rounded-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("readyToStart")}
          </h2>
          <p className="text-xl text-blue-100 mb-8">{t("joinThousands")}</p>
          <Link to="/register">
            <motion.button
              className="bg-white text-blue-600 hover:bg-slate-100 rounded-full text-lg px-8 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("getStarted")}
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </>
  );
};
