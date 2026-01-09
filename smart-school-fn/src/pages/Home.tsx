import { ArrowRight, Play, Star, Award, Users, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";

import { useEffect, useRef } from "react";
import useLanguage from "../hooks/useLanguage";
import backgroundImage from "../assets/background.jpg";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/stores";
import { fetchCurrentUser } from "../redux/features/auth";
import { ourPrograms } from "../constants/programs";

// Enhanced animation variants
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
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", "STUDENT");
      dispatch(fetchCurrentUser());
      navigate("/courses");
    } else {
      navigate("/");
    }
  }, [navigate]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="bg-white">
      {/* Hero Section - Refined Headline Size */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          y,
        }}
        className="relative py-24 lg:py-32 h-[80vh] flex items-center justify-center overflow-hidden"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Refined overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {t("transformYourFuture")}
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-100 mb-10 leading-relaxed font-medium max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {t("homeSubtitle")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-5 font-bold justify-center"
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
      </motion.section>

      {/* What We Focus On - Asymmetrical Grid */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            variants={bidirectionalFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-6 uppercase tracking-tight text-slate-900">
              {t("featuredCourses")}
            </h2>
            <div className="w-16 h-1 bg-[#1a7ea5] mx-auto mb-8 rounded-full" />
            <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
              Industry-leading programs designed for the modern workforce. We bridge the gap between education and professional excellence.
            </p>
          </motion.div>

          {/* Asymmetrical layout using 12-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {ourPrograms.map((program, i) => {
              // Create alternating pattern: Big/Small, then Small/Big
              const isFirstInPair = i % 2 === 0;
              const isEvenRow = Math.floor(i / 2) % 2 === 0;
              const colSpan = isEvenRow
                ? (isFirstInPair ? "lg:col-span-7" : "lg:col-span-5")
                : (isFirstInPair ? "lg:col-span-5" : "lg:col-span-7");

              return (
                <motion.div
                  key={program.id}
                  className={`group relative bg-white ${colSpan} p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100/50 flex flex-col justify-between`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div>
                    <div className="w-12 h-12 bg-[#6cb9cc]/10 text-[#1a7ea5] rounded-2xl flex items-center justify-center mb-10 group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-500">
                      <Star size={20} />
                    </div>
                    <h3 className="font-bold text-xl md:text-2xl mb-4 tracking-tight group-hover:text-[#1a7ea5] transition-colors leading-tight">
                      {program.title}
                    </h3>
                    <p className="text-[16px] md:text-[16px] text-slate-500 leading-relaxed mb-10">
                      {program.description}
                    </p>
                  </div>
                  <Link to="/courses" className="inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-[0.2em] text-[#1a7ea5] hover:gap-4 transition-all group/link">
                    Explore Details <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced Readability */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t("whyChooseUs")} Smart school?
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
                <h4 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-white transition-colors uppercase tracking-tight">{item.title}</h4>
                <p className="text-slate-500 text-[15px] leading-relaxed group-hover:text-white/80 transition-colors font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section - Visual "98%" Hook */}
      <section className="py-20 bg-[#6cb9cc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block p-1 bg-white/20 rounded-[50px] backdrop-blur-md mb-8"
          >
            <div className="bg-white/10 px-10 py-16 rounded-[48px] border border-white/30 backdrop-blur-xl">
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

      {/* Enhanced CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-[#1a7ea5] rounded-[48px] p-16 text-center text-white relative overflow-hidden shadow-[0_30px_60px_rgba(26,126,165,0.3)]"
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
    </div>
  );
};

// do yur best in desig and desgin home page for mordern website and reduce a lot of corol just make thing very good and more attractive with less color but vyery clear