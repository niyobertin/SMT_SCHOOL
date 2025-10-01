import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { loginUser, clearError } from "../../redux/features/auth";
import useLanguage from "../../hooks/useLanguage";
import { countryCodes } from "../../constants/countryCodes";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import googleLogo from "../../assets/search.png";
import facebookLogo from "../../assets/facebook.png";

const loginSchema: yup.ObjectSchema<FormData> = yup.object({
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
  selectedCountryCode: yup.string().nullable(),
});

type FormData = {
  identifier: string;
  password: string;
  loginWithPhone: boolean;
  selectedCountryCode?: string | null;
};

export const LoginPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

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

      // Save role in localStorage
      localStorage.setItem("userRole", response.role);

      toast.current?.show({
        severity: "success",
        summary: "Login Successful",
        detail: "You have successfully logged in!",
        life: 3000,
      });

      // Reload page
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toast ref={toast} position="top-right" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {t("loginToAccount")}
          </h2>
          <p className="text-slate-600 mt-2">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => toggleLoginMethod(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${!loginWithPhone
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLoginMethod(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${loginWithPhone
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Phone className="h-5 w-5" />
              <span>Phone</span>
            </button>
          </div>

          {!loginWithPhone ? (
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="identifier"
                type="email"
                placeholder="Enter your email"
                {...register("identifier")}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.identifier
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium">
                {t("phone")}
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCountryCodeDropdown(!showCountryCodeDropdown)
                    }
                    className={`h-10 px-3 border rounded-lg text-sm flex items-center gap-1 min-w-[80px] ${errors.selectedCountryCode
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                  >
                    {selectedCountryCode}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
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
                            setValue("selectedCountryCode", country.code);
                          }}
                        >
                          {country.code} ({country.name})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="123 456 7890"
                    {...register("identifier")}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.identifier
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      }`}
                  />
                  {errors.identifier && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>
              </div>
              {errors.selectedCountryCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.selectedCountryCode.message}
                </p>
              )}
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`w-full rounded-lg border px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 ${errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            <Link to="/request-link" className="text-blue-700 hover:underline text-sm flex justify-end">
              {t("forgotPassword")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium text-white transition ${loading ? "bg-blue-400" : "bg-blue-800 hover:bg-blue-700"
              }`}
          >
            {loading ? "Signing in..." : t("signIn")}
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
            <a href={`${import.meta.env.VITE_API_URL}/api/users/auth/google`}>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition cursor-pointer"
              >

                <img src={googleLogo} alt="Google" className="h-4 w-4" />
                Google

              </button>
            </a>
            <a href={`${import.meta.env.VITE_API_URL}/api/users/auth/facebook`}>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition cursor-pointer"
              >
                <img src={facebookLogo} alt="Facebook" className="h-6 w-6" />
                Facebook
              </button>
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
