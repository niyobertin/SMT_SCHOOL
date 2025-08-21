import React, { useState } from "react"
import { BookOpen, Eye, EyeOff, Mail, Phone } from "lucide-react"
import { Link } from "react-router-dom" 
import useLanguage from "../hooks/useLanguage";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

const countryCodes = [
  { code: '+1', name: 'US' },
  { code: '+44', name: 'UK' },
  { code: '+33', name: 'FR' },
  { code: '+49', name: 'DE' },
  { code: '+212', name: 'MA' },
  // Add more country codes as needed
]

export const LoginPage = () => {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [loginWithPhone, setLoginWithPhone] = useState(false)
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1')
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginWithPhone && !formData.phone) {
      alert('Please enter your phone number')
      return
    }
    if (!loginWithPhone && !formData.email) {
      alert('Please enter your email')
      return
    }
    
    const loginData = loginWithPhone 
      ? { phone: `${selectedCountryCode}${formData.phone}`, password: formData.password }
      : { email: formData.email, password: formData.password }
      
    console.log("Login attempt:", loginData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart School
          </h1>
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{t("loginToAccount")}</h2>
          <p className="text-slate-600 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login Method Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setLoginWithPhone(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${!loginWithPhone ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginWithPhone(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${loginWithPhone ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Phone className="h-5 w-5" />
              <span>Phone</span>
            </button>
          </div>

          {/* Email/Phone Input */}
          {!loginWithPhone ? (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                {t("phone")}
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                    className="h-10 px-3 border rounded-lg text-sm flex items-center gap-1 min-w-[80px]"
                  >
                    {selectedCountryCode}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCountryCodeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {countryCodes.map((country) => (
                        <div
                          key={country.code}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedCountryCode(country.code);
                            setShowCountryCodeDropdown(false);
                          }}
                        >
                          {country.code} ({country.name})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="123 456 7890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                  }
                  className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              {t("rememberMe")}
            </label>
            <Link to="/request-link" className="text-sm text-blue-600 hover:text-blue-800">
              {t("forgotPassword")}?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition"
          >
            {t("signIn")}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">{t("or")}</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {t("dontHaveAccount")}{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium transition">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
