import { Check, Users, Award, BookOpen, TrendingUp } from "lucide-react"
import useLanguage from "../hooks/useLanguage"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { LoginRequestModal } from "../components/RequestModal"
import type { AppDispatch, RootState } from "../redux/stores"
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from "../redux/features/courses/courseSlice"
import { motion, useScroll, useTransform } from "framer-motion"
import backgroundImage from "../assets/background.jpg"

export default function TuitionPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);

  const {
    items: courses,
  } = useSelector((state: RootState) => state.courses);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleModalOpen = (price: number, period: number, type: string, name?: string) => {
    const localToken = localStorage.getItem('accessToken');
    if (!localToken) {
      setIsModalOpen(true);
    } else {
      navigate(`/payment-flow/${price}/${period}?type=${type}&name=${name}`);
    }
  };

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchCourses({ page: 1, q: '', limit: 1000, categoryId: null }));
  }, [dispatch]);

  const filterCpaCourses = courses.filter((course: any) => {
    const categoryName = course.category.name.toLowerCase().replace(/\s+/g, "");
    const targetName = "cpa(r)".toLowerCase().replace(/\s+/g, "");
    return categoryName === targetName;
  });

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/tuition');
  };

  const handleContinue = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const plans = [
    {
      id: "weekly",
      period: 7,
      type: "tuition",
      name: "Weekly",
      description: "Perfect for beginners starting their learning journey",
      basePrice: 2000,
      popular: false,
      features: [
        "Access to 3 chosen courses",
        "Unlimited support 24/7",
        "Job listings",
        "Exam preparation via tests",
      ],
      icon: BookOpen,
    },
    {
      id: "monthly",
      period: 30,
      type: "tuition",
      name: "Monthly",
      description: "Most popular choice for serious learners",
      basePrice: 5000,
      popular: true,
      features: [
        "Access to 3 chosen courses",
        "Unlimited support 24/7",
        "Job listings",
        "Exam preparation via tests",
      ],
      icon: TrendingUp,
    },
    {
      id: "quarterly",
      period: 90,
      type: "tuition",
      name: "Quarterly",
      description: "Complete learning experience with mentorship",
      basePrice: 10000,
      popular: false,
      features: [
        "Access to 3 chosen courses",
        "Unlimited support 24/7",
        "Job listings",
        "Exam preparation via tests",
        "1-on-1 Session with mentor",
      ],
      icon: Award,
    },
    {
      id: "yearly",
      period: 365,
      type: "tuition",
      name: "Yearly",
      description: "Perfect for teams and organizations",
      basePrice: 30000,
      popular: false,
      features: [
        "Access to 3 chosen courses",
        "Unlimited support 24/7",
        "Job listings",
        "Exam preparation via tests",
        "1-on-1 Session with mentor",
      ],
      icon: Users,
    },
  ];

  const cpaPlanTemplate = [
    {
      id: "Foundation",
      type: "cpa",
      basePrice: 30000,
      period: 90,
      features: [
        "Business Mathematics & Quantitative Methods",
        "Introduction to Law",
        "Financial Accounting",
        "Business Management, Ethics & Entrepreneurship",
        "Management Accounting",
        "Economics and Business Environment",
        "Information Systems",
        "Taxation"
      ],
    },
    {
      id: "Intermediate",
      type: "cpa",
      basePrice: 40000,
      period: 90,
      features: [
        "Managerial Finance",
        "Financial Reporting",
        "Company Law",
        "Auditing"
      ],
    },
    {
      id: "Advanced",
      type: "cpa",
      basePrice: 50000,
      period: 90,
      features: [
        "Strategy & Leadership",
        "Audit Practice & Assurance Services",
        "Advanced Financial Reporting",
        "Strategic Corporate Finance",
        "Strategic Performance Management",
        "Advanced Taxation"
      ],
    },
    {
      id: "CAT",
      type: "cpa",
      basePrice: 30000,
      period: 90,
      features: [
        "Recording Financial Transactions",
        "Principles of Costing",
        "Effective Working In Accountancy",
        "Preparation of Basic Accounts",
        "Managing Costs and Cash Flows",
        "Professional Ethics",
        "Financial Accounting",
        "Public Finance Management"
      ],
    },
  ];

  const cpaPlans = cpaPlanTemplate
    .map((plan, index) => {
      const apiCourse = filterCpaCourses[index];
      let price = plan.basePrice;
      if (apiCourse) {
        const title = apiCourse.title.toLowerCase();
        if (title.includes("all courses") || title.includes("foundation")) {
          price = 30000;
        } else if (title.includes("intermediate")) {
          price = 40000;
        } else if (title.includes("advanced")) {
          price = 50000;
        }
      }

      return {
        ...plan,
        name: apiCourse ? apiCourse.title : `${plan.id} Plan`,
        basePrice: price,
      };
    })
    .sort((a, b) => a.basePrice - b.basePrice);

  return (
    <div ref={ref} className="bg-white">
      {/* Hero Section */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          y,
        }}
        className="relative py-24 lg:py-32 h-[60vh] flex items-center justify-center overflow-hidden"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative max-w-7xl mx-auto px-4 z-10 w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#6cb9cc] font-black uppercase tracking-[0.3em] text-[12px] mb-4"
          >
            Flexible Learning
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight"
          >
            Pricing & Tuition
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-200 max-w-2xl mx-auto font-medium"
          >
            Invest in your success with our transparent and flexible investment plans designed for every stage of your career.
          </motion.p>
        </div>
      </motion.section>

      {/* Main Pricing Plans */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Main Tuition Plans</h2>
            <div className="w-16 h-1 bg-[#1a7ea5] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                className={`relative group bg-white p-8 rounded-3xl border transition-all duration-500 flex flex-col h-full ${plan.popular ? "border-[#1a7ea5] shadow-[0_30px_60px_rgba(26,126,165,0.1)] ring-1 ring-[#1a7ea5]/20" : "border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1a7ea5] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <plan.icon size={24} className="text-[#1a7ea5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#1a7ea5]">{plan.basePrice}</span>
                    <span className="text-slate-400 font-bold text-sm uppercase">Frw / {plan.id === "weekly" ? "Week" : plan.id === "monthly" ? "Month" : plan.id === "quarterly" ? "Quarter" : "Year"}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-4 h-4 rounded-full bg-[#6cb9cc]/20 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-[#1a7ea5] font-black" />
                      </div>
                      <span className="text-slate-600 text-[13px] font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleModalOpen(plan.basePrice, plan.period, plan.id)}
                  className={`w-full py-4 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${plan.popular ? "bg-[#1a7ea5] text-white shadow-xl hover:bg-[#156d8f]" : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                >
                  Choose {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CPA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">CPA Specialized Plans</h2>
            <p className="text-slate-500 font-medium">Professional preparation for Certified Public Accountant success. Comprehensive materials and structured roadmaps for every section.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {cpaPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight h-14 flex items-center">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#1a7ea5]">{plan.basePrice}</span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Frw / Quarter</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-grow overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-0.5">
                      <Check size={14} className="text-[#1a7ea5] mt-1 flex-shrink-0" />
                      <span className="text-slate-600 text-[12px] font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleModalOpen(plan.basePrice, plan.period, plan.type, plan.name)}
                  className="w-full py-4 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#1a7ea5] transition-all shadow-lg"
                >
                  Enroll in {plan.id}
                </button>
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a7ea5] via-[#6cb9cc] to-[#1a7ea5] opacity-60" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
                {t("readyToStart")}
              </h2>
              <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                {t("joinThousands")}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-[#1a7ea5] px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all w-full sm:w-auto"
                >
                  {t("getStarted")}
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-white/10 backdrop-blur-md border border-white/40 text-white px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest hover:bg-white/20 transition-all w-full sm:w-auto"
                >
                  {t("contactUs")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LoginRequestModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onContinue={handleContinue}
        featureName="courses payment"
      />
    </div>
  )
}
