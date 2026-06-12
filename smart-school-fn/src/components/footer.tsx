import { Link } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import Logo from "../assets/logo.jpg";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="w-10 h-10 rounded-lg shadow-lg" />
              <span className="text-xl font-bold text-white tracking-tight">JobExam Rwanda</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-400 max-w-xs">
              Empowering the next generation of leaders in Rwanda through innovative digital education and industry-focused programs.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#6cb9cc] hover:text-white transition-all duration-300">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6cb9cc] mb-6">Platform</h4>
            <ul className="space-y-4">
              {[
                { to: "/courses", label: t("courses") },
                { to: "/tuition", label: "Pricing & Tuition" },
                { to: "/job-listing", label: "Career Portal" },
                { to: "/about", label: "Our Mission" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-[13px] hover:text-[#6cb9cc] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6cb9cc] mb-6">Support</h4>
            <ul className="space-y-4">
              {[
                { to: "/contact", label: t("contactUs") },
                { to: "#", label: "Help Center" },
                { to: "#", label: "Student Portal" },
                { to: "/exam-portal/login", label: "Exam Access" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-[13px] hover:text-[#6cb9cc] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6cb9cc] mb-6">Connect</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-1 text-[#6cb9cc]" />
                <span className="text-[13px]">JQX4+W7R Nyanza, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-[#6cb9cc]" />
                <span className="text-[13px]">jobexamrwanda@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-[#6cb9cc]" />
                <span className="text-[13px]">+250 781 212 252</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} JobExam Rwanda. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((text, i) => (
              <a key={i} href="#" className="text-[11px] text-slate-500 hover:text-[#6cb9cc] uppercase tracking-wider transition-colors">{text}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
