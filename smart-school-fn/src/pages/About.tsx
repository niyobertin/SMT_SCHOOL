import { Users, Target, Eye, Heart, Award, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import backgroundImage from "../assets/aboutimage.jpg";
import { Link } from "react-router-dom";
import cto from "../assets/cto.jpeg";
import ceo from "../assets/Picture1.png";
import olivessfd from "../assets/olive.png";
import enock from "../assets/Enock.png";

export const About = () => {
  const teamMembers = [
    {
      name: "Damascene Sibomana",
      position: "Founder/CEO,BSC, MBA, CFA",
      image: ceo,
      bio: "+250781212252"
    },
    {
      name: "Olive Niyomurinzi",
      position: "Customer relations/BSC",
      image: olivessfd,
      bio: "+250780697816"
    },
    {
      name: "Enock Iradukunda",
      position: "Head of content/BSC, CPA(R), MBA",
      image: enock,
      bio: "+250788701837",
    },
    {
      name: "Bertin Niyonkuru",
      position: "Software engineer/CTO",
      image: cto,
      bio: "+250783021801",
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Lifelong Learning",
      description: "Promoting continuous growth beyond classrooms and careers."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "Using creativity and technology to deliver modern, practical learning."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Impact",
      description: "Focusing on real results that transform learners, workplaces, and the nation."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "Striving for the highest quality in education and skills development."
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="relative py-20 lg:py-32 h-[80vh] flex items-center overflow-hidden"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
          <p className="text-2xl font-bold mb-6">About Smart School</p>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Welcome to <span className="font-bold text-yellow-600">Smart School</span>, the future of learning where education goes beyond classroom walls and adapts to the demands of today’s fast-changing world.
            Here, continuous learning is not just encouraged but made accessible through flexible, interactive, and personalized experiences designed to fit seamlessly into your life.
            Whether you are a student aiming to strengthen your studies, a professional looking to enhance your skills, or an individual pursuing a new passion,
            Smart School is here to walk with you every step of your learning journey.
          </motion.p>
        </div>
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
      </motion.section>

      <p className="text-2xl font-bold pt-6 text-center">Mission and vision</p>

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
                Our mission is to close Rwanda’s skills gap by equipping graduates and employees with practical,
                market-relevant knowledge and continuous training that enhances workplace readiness, boosts productivity,
                fosters innovation, and strengthens the nation’s competitiveness in the global economy.
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
                Our vision is to build a future where every Rwandan learner and professional has access to practical,
                lifelong education that empowers them to succeed in the workplace, drive innovation, and
                contribute to a thriving, competitive national economy.
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-gray-600 text-base leading-relaxed">{value.description}</p>
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
            <p className="text-lg text-gray-600">The passionate individuals behind Smart School</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
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
                    loading="lazy"
                    className="w-44 h-44 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                </div>
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
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.5)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/courses">Browse Courses</Link>
            </motion.button>

            <motion.button
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/contact">Contact Us</Link>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};