import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { AuthHeader } from "../../components/headers/authHeader";
import { countryCodes } from "../../constants/countryCodes";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { requestResetLink } from "../../redux/features/auth";
import { Toast } from "primereact/toast";
import { useRef } from "react";
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
  const toast = useRef<Toast>(null);
  const { loading} = useSelector(
    (state: RootState) => state.auth
  );
  const schema = (method === "email" ? emailSchema : phoneSchema) as yup.ObjectSchema<FormData>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Reset Link Sent",
          detail: data.email 
            ? "A reset link has been sent to your email." 
            : "A reset link has been sent to your phone.",
          life: 3000,
        });
      }
    } catch (err) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to send reset link. Please try again." + err,
          life: 3000,
        });
      }
    }
    reset();
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Toast ref={toast} position="top-right"/>
      <AuthHeader />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          Reset your password
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your {method === "email" ? "email address" : "phone number"} to
          receive reset instructions
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              method === "email"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              method === "phone"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Phone className="h-4 w-4" />
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {method === "email" ? (
            <div>
              <input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <div>
                <select
                  {...register("countryCode")}
                  className="w-28 border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countryCodes.map((code) => (
                    <option key={code.code} value={code.code}>
                      {code.name} ({code.code})
                    </option>
                  ))}
                </select>
                {errors.countryCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.countryCode.message as string}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Phone number"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium bg-blue-800 cursor-pointer"
          >
            {loading ? "Loading..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};
