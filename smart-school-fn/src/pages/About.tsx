import { Users, Target, Eye, Heart, BookOpen, Award, Globe, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const About = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "15+ years in educational technology with a passion for democratizing learning.",
      linkedin: "#"
    },
    {
      name: "Michael Chen",
      position: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Former Google engineer specializing in scalable learning platforms and AI.",
      linkedin: "#"
    },
    {
      name: "Dr. Emily Rodriguez",
      position: "Head of Learning Design",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "PhD in Educational Psychology with expertise in online curriculum development.",
      linkedin: "#"
    },
    {
      name: "David Kim",
      position: "Lead UX Designer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Award-winning designer focused on creating intuitive learning experiences.",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Accessibility",
      description: "We believe quality education should be available to everyone, regardless of their background or circumstances."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously explore new technologies and methodologies to enhance the learning experience."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Learning thrives in supportive communities where students and educators collaborate and grow together."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We maintain the highest standards in content quality, platform reliability, and student support."
    }
  ];

  // Animation variants
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -60 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const fadeInRight: Variants = {
    initial: { opacity: 0, x: 60 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const staggerContainer: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const bounceIn: Variants = {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-black opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        ></motion.div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            className="text-5xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Empowering Minds Through
            <motion.span
              className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              Online Learning
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Welcome to EduTech, where we're revolutionizing education by making high-quality learning accessible,
            engaging, and transformative for learners worldwide.
          </motion.p>
        </div>
      </div>

      {/* Welcome Message */}
      <motion.div
        className="py-16 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={bounceIn}>
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-8" />
          </motion.div>

          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-6"
            variants={fadeInUp}
          >
            Welcome to the Future of Learning
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 leading-relaxed mb-8"
            variants={fadeInUp}
          >
            At EduTech, we understand that learning doesn't stop at the classroom door. In today's rapidly evolving world,
            continuous learning is essential for personal and professional growth. Our platform bridges the gap between
            traditional education and modern learning needs, offering flexible, interactive, and personalized educational
            experiences that fit seamlessly into your life.
          </motion.p>

          <motion.p
            className="text-lg text-gray-600 leading-relaxed"
            variants={fadeInUp}
          >
            Whether you're a student looking to supplement your studies, a professional seeking to upskill, or someone
            pursuing a new passion, we're here to support your learning journey every step of the way.
          </motion.p>
        </div>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div
        className="py-16 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              variants={fadeInLeft}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-12 h-12 text-blue-600 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to quality education by creating an innovative online learning platform that
                connects learners with expert instructors worldwide. We strive to break down barriers to education
                and empower individuals to achieve their full potential through flexible, engaging, and effective
                learning experiences.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              variants={fadeInRight}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Eye className="w-12 h-12 text-purple-600 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's leading online learning platform, where millions of learners can access
                transformative education that adapts to their unique needs and goals. We envision a future where
                geographical boundaries don't limit learning opportunities, and where every person has the tools
                they need to succeed in an ever-changing world.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Values */}
      <motion.div
        className="py-16 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-blue-600 mb-4 flex justify-center"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        className="py-16 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The passionate individuals behind EduTech</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg"
                variants={scaleIn}
                whileHover={{
                  y: -15,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="text-center">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  <motion.a
                    href={member.linkedin}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Connect
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Globe, number: "50+", label: "Countries Served" },
              { icon: Users, number: "100K+", label: "Active Learners" },
              { icon: BookOpen, number: "5K+", label: "Courses Available" },
              { icon: Award, number: "98%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={bounceIn}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                </motion.div>
                <motion.div
                  className="text-3xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    delay: index * 0.1
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="py-16 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-6"
            variants={fadeInUp}
          >
            Ready to Start Learning?
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 mb-8"
            variants={fadeInUp}
          >
            Join thousands of learners who are already transforming their lives through our platform.
          </motion.p>

          <motion.div
            className="space-x-4"
            variants={fadeInUp}
          >
            <motion.button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.5)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Courses
            </motion.button>

            <motion.button
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};