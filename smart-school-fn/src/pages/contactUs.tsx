import React, { useState, useRef } from "react"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import useLanguage from "../hooks/useLanguage"
import { Toast } from "primereact/toast"

export const ContactPage = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useRef<Toast>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // prevent reload
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    }

    const scriptFormApi = import.meta.env.VITE_CONTACT_FORM_SCRIPT_ID
    const url = `https://script.google.com/macros/s/${scriptFormApi}/exec`
    const encoded_data = encodeURI(JSON.stringify(data))

    try {
      setLoading(true)
      const response = await fetch(`${url}?data=${encoded_data}`)
      setLoading(false)

      if (!response.ok) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to submit your message. Try again",
          life: 3000,
        })
        return
      }

      const result = await response.json()
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: result.message,
        life: 3000,
      })
    } catch (error) {
      setLoading(false)
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error instanceof Error ? error.message : "Unknown error",
        life: 3000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t("contactUs")}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("contactSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("sendMessage")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium text-slate-700">{t("name")}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={t("name")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium text-slate-700">{t("email")}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("emailAddress")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block mb-2 font-medium text-slate-700">{t("subject")}</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder={t("subject")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 font-medium text-slate-700">{t("message")}</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder={t("message")}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none shadow-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? "Loading..." : t("sendMessage")}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t("contactInfo")}</h3>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("address")}</h4>
                  <p className="text-slate-600">
                    123 Learning Street<br />
                    Education District<br />
                    Kigali, Rwanda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("phone")}</h4>
                  <p className="text-slate-600">+250 788 123 456</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("emailAddress")}</h4>
                  <p className="text-slate-600">support@exceledge.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("businessHours")}</h4>
                  <p className="text-slate-600">
                    {t("mondayToFriday")}<br />
                    {t("weekends")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast ref={toast} />
    </div>
  )
}
