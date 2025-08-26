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
      console.log(response);
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Login Successful",
          detail: "You have successfully logged in!",
          life: 3000,
        });
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                !loginWithPhone
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loginWithPhone
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
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.identifier
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
                    className={`h-10 px-3 border rounded-lg text-sm flex items-center gap-1 min-w-[80px] ${
                      errors.selectedCountryCode
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.identifier
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
                className={`w-full rounded-lg border px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 ${
                  errors.password
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
            className={`w-full py-2 rounded-lg font-medium text-white transition ${
              loading ? "bg-blue-400" : "bg-blue-800 hover:bg-blue-700"
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
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12z" />
              </svg>
              Facebook
            </button>
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
