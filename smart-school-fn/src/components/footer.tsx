import { Link } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import Logo from "../assets/logo.jpg";
export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-center mb-4">
              <div className="rounded-lg flex items-center justify-center">
                <img src={Logo} alt="Logo" className="w-20 h-20 rounded-full" />
              </div>
              <h3 className="text-xl font-bold">Smart school Rwanda</h3>
            </div>
            <p className="text-slate-400 text-center">
              {/* Empowering learners worldwide with premium educational content. */}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  to="/courses"
                  className="hover:text-white transition-colors"
                >
                  {t("courses")}
                </Link>
              </li>
              <li>
                <Link
                  to="/tuition"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">

              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  to="/#"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/#"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/#"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Smart school Learning Platform.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
