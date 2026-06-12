import { ArrowRight, Play, Star, Award, Users, Clock, Book, LayoutGrid, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { useEffect, useRef } from "react";
import useLanguage from "../hooks/useLanguage";
import backgroundImage from "../assets/background.jpg";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/stores";
import { fetchCurrentUser } from "../redux/features/auth";
import { fetchCourses } from "../redux/features/courses/courseSlice";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const bidirectionalFadeUp: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: courses, loading } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", "STUDENT");
      dispatch(fetchCurrentUser());
      navigate("/courses");
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 8 }));
  }, [dispatch]);

  const publishedCourses = Array.isArray(courses)
    ? courses.filter((c: any) => c?.isPublished)
    : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || publishedCourses.length === 0) return;
    let interval = setInterval(() => {
      const cardWidth = el.querySelector(":scope > *")?.clientWidth || 300;
      const gap = 20;
      const scrollAmount = cardWidth + gap;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [publishedCourses]);

  return (
    <div ref={ref} className="bg-white">
      {/* Hero Section */}
      <header
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="relative py-20 lg:py-28 min-h-[70vh] flex items-center justify-center overflow-hidden"
        aria-label="Hero Banner"
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 z-10 w-full text-center">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]"
            >
              Rwanda's Leading Exam Preparation & Career Development Platform
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl font-bold text-[#6cb9cc] mb-3"
            >
              Pass Exams. Build Skills. Advance Your Career.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base lg:text-lg text-gray-100 mb-4 leading-relaxed tracking-wide font-medium max-w-5xl mx-auto"
            >
              JobExam Rwanda empowers students, graduates, job seekers, and professionals with comprehensive exam preparation resources, practical learning materials, and career-focused training designed to improve academic performance, professional competence, and employment opportunities. Whether you are preparing for government recruitment exams, professional certification assessments, university entrance examinations, or workplace competency tests, JobExam Rwanda provides the tools, guidance, and practice you need to succeed.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg font-bold text-white mb-8 italic"
            >
              One Platform. Unlimited Opportunities.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 font-bold justify-center"
              variants={itemVariants}
            >
              <Link to="/register">
                <motion.button
                  className="group bg-[#1a7ea5] text-white text-[14px] uppercase tracking-wider rounded-full px-10 py-4 relative overflow-hidden shadow-xl transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "#156d8f" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative flex items-center justify-center">
                    {t("getStarted")}
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <Link to="/courses">
                <motion.button
                  className="group text-[14px] uppercase tracking-wider px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/40 hover:bg-white hover:text-[#1a7ea5] transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center justify-center">
                    <Play size={18} className="mr-2 fill-current" />
                    {t("exploreCourses")}
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <main>
      {/* What We Focus On - Horizontal Carousel */}
      <section className="py-24 bg-slate-50" aria-label="Featured Programs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-slate-900">
              Explore Our Programs
            </h2>
            <Link
              to="/courses/all"
              className="hidden sm:inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.2em] text-[#1a7ea5] hover:text-[#156d8f] transition-colors flex-shrink-0 ml-6"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          <div ref={scrollRef} className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-5 pb-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[calc(25%-15px)] snap-start p-6 rounded-3xl bg-white border border-slate-100/50 flex-shrink-0 animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl mb-6" />
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-5/6 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-6" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              ))
            ) : publishedCourses.length > 0 ? (
              publishedCourses.map((course: any, i: number) => (
                <motion.article
                  key={course.id}
                  className="group relative bg-white w-[calc(25%-15px)] snap-start rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col justify-between flex-shrink-0 overflow-hidden"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/courses/${course.id}/lessons?subscribed=false`} className="flex flex-col h-full">
                    <div className="p-5 flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] ${course.type === "free" ? "bg-neutral-100 text-neutral-700 border border-neutral-200" : "bg-neutral-900 text-white border border-neutral-900"}`}>
                          {course.type}
                        </div>
                        <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center">
                          <Crown size={14} />
                        </div>
                      </div>
                      <h3 className="font-bold text-base md:text-lg mb-2 tracking-tight group-hover:text-[#1a7ea5] transition-colors leading-tight line-clamp-2">
                        {course.title.charAt(0).toUpperCase() + course.title.slice(1).toLowerCase()}
                      </h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-3">
                        {course.shortDescription || course.description}
                      </p>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                          <Book size={11} className="text-neutral-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{course.lessons?.length || 0} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                          <LayoutGrid size={11} className="text-neutral-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{course.tests?.length || 0} Tests</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
                      <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                        {course.instructor?.firstName?.charAt(0)}{course.instructor?.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Instructor</p>
                        <p className="text-[11px] font-semibold text-slate-700 truncate">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))
            ) : (
              <p className="text-slate-400 text-sm py-8">No courses available yet.</p>
            )}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/courses/all"
              className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.2em] text-[#1a7ea5]"
            >
              View All Programs
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white" aria-label="Why Choose Us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t("whyChooseUs")} JobExam Rwanda?
            </motion.h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Discover the pillars of our educational excellence and student support system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Reliable Solution", desc: "Modern assessment methods with user-focused design." },
              { icon: Users, title: "Expert Instructors", desc: "Industry professionals with proven track records." },
              { icon: Clock, title: "Flexible Schedule", desc: "24/7 access with lifetime course availability." },
              { icon: Star, title: "Certified Excellence", desc: "Gain industry-recognized credentials for your success." },
              { icon: Play, title: "Interactive Learning", desc: "Engage with dynamic content and real-world projects." },
              { icon: ArrowRight, title: "Career Support", desc: "Guidance and opportunities beyond the classroom." }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-[20px] bg-slate-50 border border-slate-100 hover:bg-[#1a7ea5] group transition-all duration-500"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <item.icon size={24} className="text-[#1a7ea5]" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-white transition-colors uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed group-hover:text-white/80 transition-colors font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-[#6cb9cc] relative overflow-hidden" aria-label="Impact Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block p-1 bg-white/20 rounded-[40px] backdrop-blur-md mb-8"
          >
            <div className="bg-white/10 px-10 py-16 rounded-[38px] border border-white/30 backdrop-blur-xl">
              <span className="text-7xl md:text-9xl font-black text-white italic block mb-2 leading-none">98%</span>
              <p className="text-white text-lg font-bold uppercase tracking-[0.3em]">Student Success Rate</p>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-12 mt-12 max-w-4xl mx-auto">
            {[
              { label: "Active Users", val: "25K+" },
              { label: "Global Partners", val: "85+" },
              { label: "Course Modules", val: "450+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.val}</div>
                <div className="text-white/60 text-[11px] font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" aria-label="Call to Action">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-[#1a7ea5] rounded-3xl p-16 text-center text-white relative overflow-hidden shadow-[0_30px_60px_rgba(26,126,165,0.3)]"
            variants={bidirectionalFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a7ea5] via-[#6cb9cc] to-[#1a7ea5] opacity-60" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
                {t("readyToStart")}
              </h2>
              <p className="text-lg md:text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                {t("joinThousands")}
              </p>
              <Link to="/register">
                <motion.button
                  className="bg-white text-[#1a7ea5] px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Account Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </main>
    </div>
  );
};
