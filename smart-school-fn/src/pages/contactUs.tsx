import React, { useState, useRef } from "react"
import { Mail, Phone, MapPin, Clock, Send, Map } from "lucide-react"
import useLanguage from "../hooks/useLanguage"
import { Toast } from "primereact/toast"
import { motion, useScroll, useTransform } from "framer-motion"
import backgroundImage from "../assets/background.jpg"

export const ContactPage = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useRef<Toast>(null)
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
        ; (e.target as HTMLFormElement).reset()
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

  const contactInfo = [
    {
      icon: MapPin,
      title: t("address"),
      details: "JQX4+W7R Nyanza, Rwanda",
      link: "https://maps.app.goo.gl/b5DKTVxiYmGCc6ud6",
      linkText: "View on map",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Phone,
      title: t("phone"),
      details: "+250 781 212 252",
      link: "tel:+250781212252",
      linkText: "Call us",
      color: "text-[#1a7ea5]",
      bgColor: "bg-[#1a7ea5]/10"
    },
    {
      icon: Mail,
      title: t("emailAddress"),
      details: "smartschoolrwanda@gmail.com",
      link: "mailto:smartschoolrwanda@gmail.com",
      linkText: "Email us",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      icon: Clock,
      title: t("businessHours"),
      details: "Monday - Sunday (24/7)",
      link: null,
      linkText: null,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div ref={ref} className="bg-white">
      {/* Hero Section */}
      <motion.section
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          y,
        }}
        className="relative py-24 lg:py-32 h-[60vh] flex items-center justify-center overflow-hidden"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative max-w-7xl mx-auto px-4 z-10 w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#6cb9cc] font-black uppercase tracking-[0.3em] text-[12px] mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block text-lg text-gray-200 max-w-2xl mx-auto font-medium"
          >
            Have questions or need assistance? Our dedicated team is here to support your learning journey every step of the way.
          </motion.p>
        </div>
      </motion.section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Contact Form Section */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-10 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.06)] border border-slate-100">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[12px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[12px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-[12px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="How can we help?"
                      className="w-full bg-slate-50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[12px] font-black uppercase tracking-widest text-[#1a7ea5] ml-4">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Give us all the details..."
                      rows={5}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#6cb9cc] transition-all text-slate-700 placeholder:text-slate-400 font-medium resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-[#1a7ea5] text-white font-black uppercase tracking-widest rounded-full shadow-[0_20px_40px_rgba(26,126,165,0.25)] hover:bg-[#156d8f] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock size={20} />
                      </motion.div>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info Section */}
            <div className="lg:col-span-5 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-tight ml-2">Contact Link</h3>
                <div className="grid gap-6">
                  {contactInfo.map((info, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 10 }}
                      className="group flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-[#6cb9cc]/30 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-300"
                    >
                      <div className={`w-14 h-14 ${info.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                        <info.icon size={24} className={info.color} />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-1">{info.title}</h4>
                        <p className="text-slate-900 font-bold mb-1">{info.details}</p>
                        {info.link && (
                          <a
                            href={info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1a7ea5] text-xs font-black uppercase tracking-widest hover:text-[#6cb9cc] transition-colors flex items-center gap-2"
                          >
                            {info.linkText}
                            <Map size={12} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Toast ref={toast} />
    </div>
  )
}
