import { Link } from "react-router-dom";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import Logo from "../../assets/logo.jpg";
export const AuthHeader = () => {
  return (
    <header className="absolute top-4 left-4 right-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-[#5e6af6] bg-clip-text ">
            Smart school
          </h1>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
