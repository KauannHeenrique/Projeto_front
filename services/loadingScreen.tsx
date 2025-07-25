"use client";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Carregando, por favor aguarde...",
}: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
      <svg
        className="animate-spin h-8 w-8 text-[#1fa98a] mb-4" // Verde mais escuro
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
      <p className="text-sm text-[#1fa98a] font-medium">{message}</p>
    </div>
  );
}
