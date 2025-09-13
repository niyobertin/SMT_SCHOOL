type StatusMessageProps = {
  type: "loading" | "error";
  message?: string;
};

export default function StatusMessage({ type, message }: StatusMessageProps) {
  if (type === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <p className="text-indigo-600 font-medium">{message || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
          />
        </svg>
        <p className="text-red-700 font-medium">
          {message || "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return null;
}
