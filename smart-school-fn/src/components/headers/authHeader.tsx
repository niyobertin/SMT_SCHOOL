import { Link } from "react-router-dom";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import Logo from "../../assets/logo.jpg";
export const AuthHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-md py-4 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-[#5e6af6] bg-clip-text ">
            JobExam Rwanda
          </h1>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
