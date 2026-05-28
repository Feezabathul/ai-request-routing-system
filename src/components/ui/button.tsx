import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: React.ReactNode;
}

const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  disabled = false,
  className,
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;
  const combined = twMerge(
    clsx(baseStyles, variantStyles[variant], {
      "opacity-50 cursor-not-allowed": isDisabled,
    }),
    className,
  );

  return (
    <button className={combined} disabled={isDisabled} {...rest}>
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
      ) : null}
      {children}
    </button>
  );
};
