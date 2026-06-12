import { Check, Users, Award, BookOpen, TrendingUp } from "lucide-react"
import useLanguage from "../hooks/useLanguage"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { LoginRequestModal } from "../components/RequestModal"
import { motion } from "framer-motion"

export default function TuitionPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = (price: number, period: number, type: string, name?: string) => {
    const localToken = localStorage.getItem('accessToken');
    if (!localToken) {
      setIsModalOpen(true);
    } else {
      navigate(`/payment-flow/${price}/${period}?type=${type}&name=${name}`);
    }
  };

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

  const cpaPlans = [
    {
      id: "Foundation Plan",
      level: "Foundation Plan – Technical Level",
      description: "Lays the foundation of accounting knowledge and professional values.",
      tag: "Level 1",
      modules: [
        "Financial Accounting",
        "Management Accounting",
        "Taxation",
        "Audit and Assurance",
      ],
    },
    {
      id: "CAT Plan",
      level: "CAT Plan – Operational Level",
      description: "Develops application skills and operational decision making.",
      tag: "Level 2",
      modules: [
        "Ethics, Law and Governance",
        "Digital Finance",
        "Financial Management",
        "Financial Reporting",
        "Advanced Taxation",
      ],
    },
    {
      id: "Intermediate Plan",
      level: "Intermediate Plan – Strategic Level",
      description: "Builds strategic insight, leadership, and sector-specific expertise.",
      tag: "Level 3",
      modules: [
        "Strategic Management",
        "Advanced Audit and Assurance",
        "Advanced Financial Reporting",
        "Advanced Financial Management",
        "Managing Business Performance",
        "Managing Performance in the Public Sector",
        "Advanced Public Financial Management",
      ],
    },
    {
      id: "Professional Level",
      level: "Professional Level",
      description: "The final stage focuses on integrated, real-life decision-making through a Test of Professional Competence.",
      tag: "Level 4",
      modules: [
        "Public Sector Pathway",
        "Private Sector Pathway",
      ],
    },
  ];

  return (
    <div className="bg-white">
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

      {/* CPA Specialized Plans - Curriculum */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1a7ea5]/5 rounded-full text-[#1a7ea5] text-[10px] font-bold uppercase tracking-widest mb-4 border border-[#1a7ea5]/10">
              CPA Rwanda
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">
              CPA Specialized Plans
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl mx-auto">
              Professional preparation for Certified Public Accountant success. Comprehensive materials and structured roadmaps for every section.
            </p>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cpaPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="inline-block px-3 py-1 bg-[#1a7ea5]/5 text-[#1a7ea5] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-[#1a7ea5]/10">
                      {plan.tag}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{plan.level}</h3>
                  </div>
                  <div className="w-12 h-12 bg-[#6cb9cc]/10 rounded-2xl flex items-center justify-center text-[#1a7ea5] flex-shrink-0 ml-4">
                    <Award size={24} />
                  </div>
                </div>

                <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="border-t border-slate-100 pt-6 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    {plan.id === "Professional Level" ? "Pathways" : "Modules"}
                  </h4>
                  <div className="space-y-3">
                    {plan.modules.map((module, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#1a7ea5]/10 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-[#1a7ea5]" />
                        </div>
                        <span className="text-slate-700 text-[13px] font-medium leading-snug">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.id === "Professional Level" && (
                  <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <p className="text-amber-800 text-[12px] font-medium leading-relaxed">
                      <strong>Note:</strong> Students choose between the <strong>Public Sector Pathway</strong> or <strong>Private Sector Pathway</strong> based on career goals.
                    </p>
                  </div>
                )}
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
