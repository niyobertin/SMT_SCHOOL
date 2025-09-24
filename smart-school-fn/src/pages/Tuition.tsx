import { Check, Users, Award, BookOpen, TrendingUp, Loader2 } from "lucide-react"
import useLanguage from "../hooks/useLanguage"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { LoginRequestModal } from "../components/RequestModal"
import type { AppDispatch, RootState } from "../redux/stores"
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from "../redux/features/courses/courseSlice"

export default function TuitionPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    items: courses,
    loading,
    error,
  } = useSelector((state: RootState) => state.courses);

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
      period: 1,
      type: "tuition",
      name: t("weekly"),
      description: "Perfect for beginners starting their learning journey",
      basePrice: 100,
      popular: false,
      features: [
        t("accessToCourses"),
        t("limitedSupport"),
        t("basicCertificates"),
        "Mobile app access",
        "Basic progress tracking",
        "Community forum access",
      ],
      icon: BookOpen,
      color: "from-gray-500 to-gray-600",
    },
    {
      id: "monthly",
      period: 30,
      type: "tuition",
      name: t("monthly"),
      description: "Most popular choice for serious learners",
      basePrice: 5000,
      popular: true,
      features: [
        t("allCourses"),
        t("prioritySupport"),
        t("advancedCertificates"),
        "Downloadable resources",
        "Advanced analytics",
        "Live Q&A sessions",
        "Project reviews",
      ],
      icon: TrendingUp,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "quarterly",
      period: 90,
      type: "tuition",
      name: t("quarterly"),
      description: "Complete learning experience with mentorship",
      basePrice: 10000,
      popular: false,
      features: [
        t("unlimitedAccess"),
        t("premiumSupport"),
        t("verifiedCertificates"),
        t("personalMentor"),
        "1-on-1 coaching sessions",
        "Career guidance",
        "Portfolio reviews",
        "Job interview prep",
      ],
      icon: Award,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "yearly",
      period: 365,
      type: "tuition",
      name: t("yearly"),
      description: "Perfect for teams and organizations",
      basePrice: 30000,
      popular: false,
      features: [
        t("customLearning"),
        t("teamManagement"),
        t("analyticsReports"),
        t("dedicatedManager"),
        "Custom integrations",
        "Bulk user management",
        "Advanced reporting",
        "Priority onboarding",
      ],
      icon: Users,
      color: "from-green-500 to-teal-600",
    },
  ]

  const cpaPlanTemplate = [
    {
      id: "Foundation",
      type: "cpa",
      basePrice: 30000,
      period: 90,
      features: [
        "Study material",
        "Mock Practices",
        "Examination Model Answers",
        "✓ F1.1 BUSINESS MATHEMATICS AND Quantitative Methods",
        "✓ F1.2 INTRODUCTION TO LAW",
        "✓ F1.3 FINANCIAL ACCOUNTING",
        "✓ F1.4 BUSINESS MANAGEMENT, ETHICS & Entrepreneurship",
        "✓ F2.1 MANAGEMENT ACCOUNTING",
        "✓ F2.2 ECONOMICS AND THE BUSINESS environment",
        "✓ F2.3 INFORMATION SYSTEMS",
        "✓ F2.4 TAXATION",
      ],
    },
    {
      id: "CAT",
      type: "cpa",
      basePrice: 30000,
      period: 90,
      features: [
        "Study material",
        "Mock Practices",
        "Examination Model Answers",
        "S1.1 Recording Financial Transactions",
        "S1.2 Principles Of Costing",
        "S1.3 Effective Working In Accountancy And Finance",
        "S2.1 Preparation Of Basic Accounts",
        "S2.2 Managing Costs And Cash Flows",
        "S2.3 Professional Ethics In Accounting And Finance",
        "S3.1 Financial Accounting",
        "S3.2 Management Accounting",
        "S3.3 Taxation",
        "S3.4 Audit And Assurance",
        "S3.5 Credit Management",
        "S3.6 Public Finance Management",
      ],
    },
    {
      id: "Intermediate",
      type: "cpa",
      basePrice: 40000,
      period: 90,
      features: [
        "Study material",
        "Mock Practices",
        "Examination Model Answers",
        "I1.1 MANAGERIAL FINANCE",
        "I1.2 FINANCIAL REPORTING",
        "I1.3 COMPANY LAW",
        "I1.4 AUDITING",
      ],
    },
    {
      id: "Advanced",
      type: "cpa",
      basePrice: 50000,
      period: 90,
      features: [
        "Study material",
        "Mock Practices",
        "Examination Model Answers",
        "A1.1 STRATEGY & LEADERSHIP",
        "A1.2 AUDIT PRACTICE & ASSURANCE SERVICES",
        "A1.3 ADVANCED FINANCIAL REPORTING",
        "A2.1 STRATEGIC CORPORATE FINANCE",
        "A2.2 STRATEGIC PERFORMANCE Management",
        "A2.3 ADVANCED TAXATION",
      ],
    },
  ];

  const cpaPlans = cpaPlanTemplate.map((plan, index) => {
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
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t("pricingPlans")}</h1>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`relative group hover:shadow-2xl transition-all duration-300 border rounded-2xl bg-white/80 backdrop-blur-sm p-6 ${plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {t("mostPopular")}
                    </span>
                  </div>
                )}

                <div className="text-center pb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{plan.basePrice}Frw</div>
                  <div className="text-gray-500 text-sm">
                    {plan.id === "weekly" ? t("perWeek") : plan.id === "monthly" ? t("perMonth") : plan.id === "quarterly" ? "" : plan.id === "yearly" ? t("perYear") : ""}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleModalOpen(plan.basePrice, plan.period, plan.id)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all bg-blue-800 hover:bg-blue-600 text-white`}
                >
                  {t("choosePlan")}
                </button>
              </div>
            )
          })}
        </div>
        <div className="text-center py-8 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-black mb-2">
            CPA Courses Based Plan
          </h1>

          <p className="text-black mb-4 font-semibold">
            A structured learning program tailored for Certified Public Accountant (CPA) exam preparation.
          </p>
          <p className="text-black leading-relaxed">
            This plan provides access to curated study materials, practice tests,
            and step-by-step lessons for each CPA exam section. It helps learners
            progress at their own pace while mastering core accounting, auditing,
            taxation, and financial reporting concepts. Whether you’re just
            starting your CPA journey or brushing up on key topics, this plan
            supports your success with a clear and flexible roadmap.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {cpaPlans.map((plan) => {
            return (
              <div
                key={plan.id}
                className="relative group hover:shadow-2xl transition-all duration-300 border rounded-2xl bg-white/80 backdrop-blur-sm p-6 flex flex-col h-full"
              >
                <div className="text-center pb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{plan.basePrice}Frw</div>
                  <div className="text-gray-500 text-sm">
                    {plan.id === "Foundation"
                      ? ""
                      : plan.id === "Intermediate"
                        ? ""
                        : plan.id === "Advanced"
                          ? ""
                          : plan.id === "CAT"
                            ? ""
                            : ""}
                  </div>
                </div>

                <div className="space-y-3 mb-8 overflow-auto max-h-72 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleModalOpen(plan.basePrice, plan.period, plan.type, plan.name)}
                    className="w-full py-3 px-4 rounded-xl font-semibold transition-all bg-blue-800 hover:bg-blue-600 text-white"
                  >
                    {t("choosePlan")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-blue-800 py-16 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">{t("readyToStart")}</h2>
            <p className="text-xl text-blue-100 mb-8">{t("joinThousands")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/login')} className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100">
                {t("getStarted")}
              </button>
              <button onClick={() => navigate('/contact')} className="px-6 py-3 border border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 bg-transparent">
                {t("contactUs")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <LoginRequestModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onContinue={handleContinue}
        featureName="courses payment"
      />
    </div>
  )
}
