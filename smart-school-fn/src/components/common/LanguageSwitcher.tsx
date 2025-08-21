import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

export const LanguageSwitcher = () => {
  const { language, setLanguage, languages } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">
          {languages.find((lang) => lang.code === language)?.name ||
            language.toUpperCase()}
        </span>
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
          onMouseLeave={() => setShowDropdown(false)}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                language === lang.code
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
