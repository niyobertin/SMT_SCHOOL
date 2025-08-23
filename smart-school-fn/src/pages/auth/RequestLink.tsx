import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { AuthHeader } from "../../components/headers/authHeader";
import { countryCodes } from "../../constants/countryCodes";

export const RequestReset = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    countryCode: "+1",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset request:", { method, formData });
    // 🔑 Call API to request reset (email or phone)
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "email" ? (
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="flex gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-28 border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countryCodes.map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.name} ({code.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium bg-blue-800 cursor-pointer "
          >
            Send Reset Link
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
