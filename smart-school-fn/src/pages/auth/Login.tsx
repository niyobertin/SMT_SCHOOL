import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "primereact/toast";

import { loginUser, clearError } from "../../redux/features/auth";
import useLanguage from "../../hooks/useLanguage";
import { countryCodes } from "../../constants/countryCodes";
import type { AppDispatch, RootState } from "../../redux/stores";

import googleLogo from "../../assets/search.png";
import facebookLogo from "../../assets/facebook.png";

const loginSchema = yup.object().shape({
  identifier: yup.string().required("Email or phone is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
  loginWithPhone: yup.boolean().required(),
  selectedCountryCode: yup.string().required(),
});

type FormData = {
  identifier: string;
  password: string;
  loginWithPhone: boolean;
  selectedCountryCode: string;
};

export const LoginPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [loginWithPhone, setLoginWithPhone] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+250");

  const toast = useRef<Toast>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      loginWithPhone: false,
      selectedCountryCode: "+250",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "ADMIN" || role === "INSTRUCTOR") {
      navigate("/dashboard");
    } else if (role) {
      navigate("/courses");
    }
  }, [navigate]);

  useEffect(() => {
    setValue("loginWithPhone", loginWithPhone);
    setValue("selectedCountryCode", selectedCountryCode);
  }, [loginWithPhone, selectedCountryCode, setValue]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [loginWithPhone, dispatch, error, trigger]);

  useEffect(() => {
    if (error && toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Login Failed",
        detail: error,
        life: 3000,
      });
    }
  }, [error]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const loginData = {
      identifier: data.loginWithPhone
        ? `${data.selectedCountryCode}${data.identifier}`
        : data.identifier,
      password: data.password,
    };
    try {
      const response = await dispatch(loginUser(loginData)).unwrap();
      localStorage.setItem("userRole", response.role);
      toast.current?.show({
        severity: "success",
        summary: "Login Successful",
        detail: "You have successfully logged in!",
        life: 3000,
      });
      window.location.reload();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: "Invalid credentials",
        life: 3000,
      });
    }
  };

  const toggleLoginMethod = (usePhone: boolean) => {
    setLoginWithPhone(usePhone);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden font-outfit">
      {/* Background depth effect matching ExamLogin */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      <Toast ref={toast} position="top-right" />

      <div className="relative w-full max-w-[420px] z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Overlapping Avatar matching ExamLogin */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Login Card with reduced padding */}
          <div className="bg-white pt-12 pb-6 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">
            <div className="text-center mb-4">
              <h2 className="text-xl text-gray-500 font-light tracking-wide italic uppercase">
                {t("loginToAccount")}
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5 italic font-light">Secure Account Access</p>
            </div>

            <div className="space-y-2.5">
              {/* Toggle switch for Phone/Email */}
              <div className="flex p-0.5 bg-[#eeeeee] rounded-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleLoginMethod(false)}
                  className={`flex-1 py-1 rounded-sm text-xs transition-all ${!loginWithPhone
                    ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                    : "text-gray-400"
                    }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => toggleLoginMethod(true)}
                  className={`flex-1 py-1 rounded-sm text-xs transition-all ${loginWithPhone
                    ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                    : "text-gray-400"
                    }`}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <AnimatePresence mode="wait">
                  {!loginWithPhone ? (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <input
                        type="email"
                        {...register("identifier")}
                        placeholder="Email Address"
                        className="w-full bg-[#eeeeee] border border-gray-200 rounded-sm py-1.5 px-4 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      {errors.identifier && (
                        <p className="text-[10px] text-red-500 mt-0.5 italic">{errors.identifier.message}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="phone"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div className="flex gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                            className="h-[32px] px-2 bg-[#eeeeee] border border-gray-200 rounded-sm text-xs text-gray-500 flex items-center gap-1 min-w-[65px] focus:outline-none"
                          >
                            {selectedCountryCode}
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showCountryCodeDropdown && (
                            <div className="absolute z-50 mt-1 w-32 bg-white border border-gray-100 shadow-xl max-h-40 overflow-auto p-1">
                              {countryCodes.map((country) => (
                                <div
                                  key={country.code}
                                  className="px-3 py-1.5 text-xs text-gray-500 hover:bg-[#eeeeee] hover:text-[#1a7ea5] cursor-pointer"
                                  onClick={() => {
                                    setSelectedCountryCode(country.code);
                                    setShowCountryCodeDropdown(false);
                                    setValue("selectedCountryCode", country.code);
                                  }}
                                >
                                  {country.code} <span className="text-gray-400 ml-1 font-normal">{country.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          {...register("identifier")}
                          placeholder="Phone Number"
                          className="flex-1 bg-[#eeeeee] border border-gray-200 rounded-sm py-1.5 px-4 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                      </div>
                      {errors.identifier && (
                        <p className="text-[10px] text-red-500 mt-0.5 italic">{errors.identifier.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Password"
                    className="w-full bg-[#eeeeee] border border-gray-200 rounded-sm py-1.5 px-4 pr-10 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {errors.password && <p className="text-[10px] text-red-500 mt-0.5 italic">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end pt-0">
                  <Link to="/request-link" className="text-[10px] text-gray-400 hover:text-[#1a7ea5] italic transition-colors leading-none">
                    {t("forgotPassword")}?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-2 text-lg font-medium transition-colors shadow-md rounded-[2px]"
                >
                  {loading ? "Verifying..." : t("signIn")}
                </button>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-light uppercase tracking-widest">
                  <span className="bg-white px-3 text-gray-300 italic">{t("or")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${import.meta.env.VITE_API_URL}/api/users/auth/google`}
                  className="flex items-center justify-center gap-2 bg-[#eeeeee] py-1.5 transition-all hover:bg-gray-200"
                >
                  <img src={googleLogo} alt="Google" className="h-4 w-4" />
                  <span className="text-[10px] text-gray-500 font-medium">Google</span>
                </a>
                <a
                  href={`${import.meta.env.VITE_API_URL}/api/users/auth/facebook`}
                  className="flex items-center justify-center gap-2 bg-[#1877F2] py-1.5 transition-all hover:bg-[#166fe5]"
                >
                  <img src={facebookLogo} alt="Facebook" className="h-4 w-4 brightness-0 invert" />
                  <span className="text-[10px] text-white font-medium">Facebook</span>
                </a>
              </div>

              <p className="pt-2 text-center text-[12px] text-gray-400 font-light">
                {t("dontHaveAccount")}{" "}
                <Link to="/register" className="text-[#1a7ea5] hover:underline font-normal italic">
                  {t("signUp")}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
