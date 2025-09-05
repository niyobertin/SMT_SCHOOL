import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function BackButton({ className = '', onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      <span>Back</span>
    </button>
  );
}
