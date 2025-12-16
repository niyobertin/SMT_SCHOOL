import { Award, ArrowRight, Play, Star } from "lucide-react";
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

// Bidirectional animation variants
const bidirectionalFadeUp: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const bidirectionalScale: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      type: "spring",
      stiffness: 100
    }
  }
};

const bidirectionalSlide: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
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
    <div ref={ref}>
      {/* Hero Section with Parallax */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          y,
        }}
        className="relative py-20 lg:py-32 h-[80vh] flex items-center overflow-hidden"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Animated overlay with gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            <motion.h1
              variants={itemVariants}
              className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight"
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                {t("transformYourFuture")}
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {t("homeSubtitle")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 font-medium justify-center"
              variants={itemVariants}
            >
              <Link to="/register">
                <motion.button
                  className="group bg-[#19459d] text-white text-lg rounded-full px-8 py-4 relative overflow-hidden shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(25, 69, 157, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center">
                    {t("getStarted")}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <Link to="/courses">
                <motion.button
                  className="group text-lg px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white hover:text-gray-900 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    {t("exploreCourses")}
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* What We Focus On - Interactive Mosaic Layout */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-cyan-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            variants={bidirectionalFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-800 text-sm font-medium mb-6"
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              What We Focus On
            </motion.div>

            <motion.h2
              className="text-4xl md:text-6xl font-bold mb-6"
              variants={bidirectionalSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                {t("featuredCourses")}
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.3 }}
            >
              Discover our comprehensive programs designed to transform your career and future
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 px-4 md:px-8">
            {ourPrograms.map((program, i) => (
              <motion.div
                key={program.id}
                className="relative rounded-2xl overflow-hidden  flex flex-col h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Card Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8 text-black">
                  <h3 className="font-bold text-2xl md:text-3xl mb-3 leading-tight">
                    {program.title}
                  </h3>
                  <p className="text-black/90 text-sm md:text-base mb-6 leading-relaxed">
                    {program.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            variants={bidirectionalFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              variants={bidirectionalScale}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              {t("whyChooseUs")}{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: 0.3 }}
              >
                Smart School?
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-blue-200 max-w-3xl mx-auto"
              variants={bidirectionalSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              Experience learning like never before with our innovative approach to education
            </motion.p>
          </motion.div>
          <div className="relative">
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-[#19459d] to-blue-500 rounded-full flex items-center justify-center shadow-2xl z-20"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 50px rgba(25, 69, 157, 0.8)",
                rotate: 360
              }}
            >
              <Star className="w-12 h-12 text-white" />
            </motion.div>
            <div className="relative w-full h-[800px] flex items-center justify-center">
              {[
                {
                  icon: Award,
                  title: "Comprehensive Learning",
                  description: "Education tailored to Rwanda's context with practical relevance",
                  position: { top: "8%", left: "40%", transform: "translateX(-50%)" },
                  delay: 0.1
                },
                {
                  icon: Award,
                  title: "Variety of Resources",
                  description: "Diverse study materials for multiple career paths",
                  position: { top: "25%", right: "20%" },
                  delay: 0.2
                },
                {
                  icon: Award,
                  title: "Reliable Solution",
                  description: "Modern assessment methods with user-focused design",
                  position: { top: "50%", right: "5%" },
                  delay: 0.3
                },
                {
                  icon: Award,
                  title: "Multi-Format Learning",
                  description: "Videos, audio, and PDFs tailored to your style",
                  position: { top: "10%", right: "2%" },
                  delay: 0.4
                },
                {
                  icon: Award,
                  title: "Expert Instructors",
                  description: "Industry professionals with proven track records",
                  position: { bottom: "10%", left: "50%", transform: "translateX(-50%)" },
                  delay: 0.5
                },
                {
                  icon: Award,
                  title: "Flexible Schedule",
                  description: "24/7 access with lifetime course availability",
                  position: { bottom: "25%", left: "15%" },
                  delay: 0.6
                },
                {
                  icon: Award,
                  title: "Affordable Cost",
                  description: "Quality learning accessible to everyone",
                  position: { top: "20%", left: "5%" },
                  delay: 0.7
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="absolute group cursor-pointer"
                  style={feature.position}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: feature.position.left === "50%" ? 0 : (feature.position.left ? -100 : 100),
                    y: feature.position.top === "50%" ? 0 : (feature.position.top ? -50 : 50)
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0
                  }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    delay: feature.delay,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.1,
                    zIndex: 30,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Connection Line */}
                  <motion.div
                    className="absolute w-1 h-24 bg-gradient-to-b from-blue-400/50 to-transparent"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "top center",
                      transform: `translateX(-50%) rotate(${i * (360 / 7) - 90
                        }deg)`
                    }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ delay: feature.delay + 0.3, duration: 0.6 }}
                  />

                  {/* Feature Bubble */}
                  <motion.div
                    className="relative w-48 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl"
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderColor: "rgba(25, 69, 157, 0.5)",
                      boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                    }}
                  >
                    {/* Glowing Icon */}
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg"
                      whileHover={{
                        rotate: 360,
                        boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    <h3 className="font-bold text-lg mb-3 text-white text-center group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-blue-100 text-sm leading-relaxed text-center opacity-90">
                      {feature.description}
                    </p>

                    {/* Hover Effect Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Animated Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {[...Array(7)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx="50%"
                  cy="50%"
                  r={150 + i * 20}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, rotate: 0 }}
                  animate={{
                    pathLength: 1,
                    rotate: 360,
                  }}
                  transition={{
                    pathLength: { duration: 2, delay: i * 0.2 },
                    rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" }
                  }}
                />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-br from-[#19459d] via-blue-600 to-blue-800 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 rounded-3xl relative overflow-hidden"
        variants={bidirectionalScale}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            variants={bidirectionalFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {t("readyToStart")}
          </motion.h2>

          <motion.p
            className="text-xl text-blue-100 mb-8 leading-relaxed"
            variants={bidirectionalSlide}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {t("joinThousands")}
          </motion.p>

          <Link to="/register">
            <motion.button
              className="group bg-white text-blue-600 hover:bg-gray-100 rounded-full text-lg px-10 py-4 font-semibold shadow-xl relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(255,255,255,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              variants={bidirectionalFadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center">
                {t("getStarted")}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};