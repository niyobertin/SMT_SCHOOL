import { useState, useRef } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "primereact/toast";

import { countryCodes } from "../../constants/countryCodes";
import { requestResetLink } from "../../redux/features/auth";
import type { RootState, AppDispatch } from "../../redux/stores";

const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const phoneSchema = yup.object().shape({
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .matches(/^\d+$/, "Phone must contain only numbers")
    .min(6, "Too short")
    .required("Phone number is required"),
});

type FormData = {
  email?: string;
  countryCode?: string;
  phone?: string;
};

export const RequestReset = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const toast = useRef<Toast>(null);

  const { loading } = useSelector((state: RootState) => state.auth);
  const schema = (method === "email" ? emailSchema : phoneSchema) as yup.ObjectSchema<FormData>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      countryCode: "+250",
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let identifier: string;
      if (data.email) {
        identifier = data.email;
      } else if (data.countryCode && data.phone) {
        identifier = data.countryCode + data.phone;
      } else {
        return;
      }

      await dispatch(requestResetLink(identifier)).unwrap();
      toast.current?.show({
        severity: "success",
        summary: "Reset Link Sent",
        detail: data.email
          ? "A reset link has been sent to your email."
          : "A reset link has been sent to your phone.",
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to send reset link. Please try again.",
        life: 3000,
      });
    }
    reset();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden font-outfit">
      {/* Background depth effect matching ExamLogin */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/login" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>
      </div>

      <Toast ref={toast} position="top-right" />

      <div className="relative w-full max-w-[420px] z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Overlapping Avatar matching ExamLogin */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Card matching ExamLogin */}
          <div className="bg-white pt-14 pb-8 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">
            <div className="text-center mb-5">
              <h2 className="text-2xl text-gray-500 font-light tracking-wide italic uppercase">
                Reset Password
              </h2>
              <p className="text-xs text-gray-400 mt-1 italic font-light">Enter details to receive instructions</p>
            </div>

            <div className="space-y-4">
              {/* Toggle switch */}
              <div className="flex p-0.5 bg-[#eeeeee] rounded-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex-1 py-1 rounded-sm text-xs transition-all ${method === "email"
                    ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                    : "text-gray-400"
                    }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex-1 py-1 rounded-sm text-xs transition-all ${method === "phone"
                    ? "bg-white text-[#1a7ea5] shadow-sm font-bold"
                    : "text-gray-400"
                    }`}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence mode="wait">
                  {method === "email" ? (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="Email Address"
                        className="w-full bg-[#eeeeee] border border-gray-200 rounded-sm py-2 px-4 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-red-500 mt-1 italic">{errors.email.message}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="phone"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                            className="h-[38px] px-2 bg-[#eeeeee] border border-gray-200 rounded-sm text-xs text-gray-500 flex items-center gap-1 min-w-[65px] focus:outline-none"
                          >
                            {/* Simple display of current code */}
                            +250
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
                                    setValue("countryCode", country.code);
                                    setShowCountryCodeDropdown(false);
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
                          {...register("phone")}
                          placeholder="Phone Number"
                          className="flex-1 bg-[#eeeeee] border border-gray-200 rounded-sm py-2 px-4 text-left text-gray-700 focus:ring-1 focus:ring-[#1a7ea5] focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[10px] text-red-500 mt-1 italic">{errors.phone.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-2.5 text-lg font-medium transition-colors shadow-md rounded-[2px]"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
