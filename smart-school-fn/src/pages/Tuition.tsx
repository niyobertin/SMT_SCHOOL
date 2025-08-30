import { Check, Users, Award, BookOpen, TrendingUp } from "lucide-react"
import useLanguage from "../hooks/useLanguage"

export default function TuitionPage() {
  const { t } = useLanguage()

  const plans = [
    {
      id: "weekly",
      name: t("weekly"),
      description: "Perfect for beginners starting their learning journey",
      basePrice: 2000,
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
      name: t("yearly"),
      description: "Perfect for teams and organizations",
      basePrice: 15000,
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
                className={`relative group hover:shadow-2xl transition-all duration-300 border rounded-2xl bg-white/80 backdrop-blur-sm p-6 ${
                  plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
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
                    {plan.id === "weekly" ? t("perWeek") : plan.id === "monthly" ? t("perMonth") : plan.id === "quarterly" ? "": plan.id === "yearly" ? t("perYear") : ""}
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
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-blue-800 hover:bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {t("choosePlan")}
                </button>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-800 py-16 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">{t("readyToStart")}</h2>
            <p className="text-xl text-blue-100 mb-8">{t("joinThousands")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100">
                {t("getStarted")}
              </button>
              <button className="px-6 py-3 border border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 bg-transparent">
                {t("contactUs")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
