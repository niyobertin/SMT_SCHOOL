import { Users, Target, Eye, Heart, Award, Lightbulb } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useRef } from 'react';
import backgroundImage from "../assets/aboutimage.jpg";
import { Link } from "react-router-dom";
import cto from "../assets/cto.jpeg";
import ceo from "../assets/Picture1.png";
import olivessfd from "../assets/olive.png";
import enock from "../assets/Enock.png";
import useLanguage from '../hooks/useLanguage';

export const About = () => {
  const { } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

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
      position: "Software engineer",
      image: cto,
      bio: "+250783021801",
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Lifelong Learning",
      description: "Promoting continuous growth beyond classrooms and careers."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Using creativity and technology to deliver modern, practical learning."
    },
    {
      icon: Users,
      title: "Impact",
      description: "Focusing on real results that transform learners, workplaces, and the nation."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Striving for the highest quality in education and skills development."
    }
  ];

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div ref={ref} className="bg-white">
      {/* Hero Section */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          y,
        }}
        className="relative py-24 lg:py-32 h-[70vh] flex items-center justify-center overflow-hidden"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeInUp}
              className="text-[#6cb9cc] font-black uppercase tracking-[0.3em] text-[12px] mb-4"
            >
              Elite Education
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight uppercase"
            >
              About JobExam
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="hidden md:block text-lg text-gray-100 mb-10 leading-relaxed font-medium max-w-2xl mx-auto"
            >
              The future of learning where education goes beyond classroom walls and adapts to the demands of today’s fast-changing world.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Intro Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-16 h-1 bg-[#1a7ea5] mx-auto mb-10 rounded-full" />
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
              Welcome to <span className="text-[#1a7ea5] font-bold">JobExam Rwanda</span>. Here, continuous learning is made accessible through flexible, interactive, and personalized experiences designed to fit seamlessly into your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission and Vision - Asymmetrical Grid Pattern */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Mission */}
            <motion.div
              className="lg:col-span-7 group bg-white p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-[#6cb9cc]/10 text-[#1a7ea5] rounded-3xl flex items-center justify-center mb-10 group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-500">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Our Mission</h3>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                To close Rwanda’s skills gap by equipping graduates and employees with practical,
                market-relevant knowledge and continuous training that enhances workplace readiness, boosts productivity,
                fosters innovation, and strengthens national competitiveness.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              className="lg:col-span-5 group bg-[#1a7ea5] p-12 rounded-3xl shadow-[0_20px_50px_rgba(26,126,165,0.2)] hover:shadow-[0_40px_80px_rgba(26,126,165,0.3)] transition-all duration-500 text-white"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Eye size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-6 uppercase tracking-tight">Our Vision</h3>
              <p className="text-lg text-white/90 leading-relaxed font-medium">
                To build a future where every Rwandan learner has access to practical,
                lifelong education that empowers them to drive innovation and contribute to a thriving national economy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight"
              {...fadeInUp}
              initial="hidden"
              whileInView="visible"
            >
              Our Core Values
            </motion.h2>
            <div className="w-16 h-1 bg-[#1a7ea5] mx-auto mb-8 rounded-full" />
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">The principles that guide everything we do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-[#1a7ea5] group transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <value.icon size={26} className="text-[#1a7ea5]" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-4 group-hover:text-white transition-colors uppercase tracking-tight">{value.title}</h4>
                <p className="text-slate-500 text-[15px] leading-relaxed group-hover:text-white/80 transition-colors font-medium">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Meet Our Team</h2>
            <p className="text-lg text-slate-500 font-medium">The passionate individuals behind JobExam Rwanda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all duration-500 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative mb-8 inline-block">
                  <div className="absolute inset-0 bg-[#6cb9cc] rounded-full scale-105 opacity-0 group-hover:opacity-20 transition-opacity" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-white shadow-md relative z-10"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">{member.name}</h3>
                <p className="text-[#1a7ea5] font-black text-[12px] uppercase tracking-widest mb-4">{member.position}</p>
                <p className="text-slate-500 text-sm font-medium">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-[#1a7ea5] rounded-3xl p-16 text-center text-white relative overflow-hidden shadow-[0_30px_60px_rgba(26,126,165,0.3)]"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a7ea5] via-[#6cb9cc] to-[#1a7ea5] opacity-60" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
                Ready to Start Learning?
              </h2>
              <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Join thousands of learners who are already transforming their lives through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link to="/courses">
                  <motion.button
                    className="bg-white text-[#1a7ea5] px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Courses
                  </motion.button>
                </Link>
                <Link to="/contact">
                  <motion.button
                    className="bg-white/10 backdrop-blur-md border border-white/40 text-white px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest hover:bg-white/20 transition-all w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact Us
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
