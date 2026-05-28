import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 ring-gray-200",
  secondary: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  destructive: "bg-red-100 text-red-800 ring-red-200",
  outline: "bg-transparent text-gray-800 ring-gray-300",
};

export const Badge: React.FC<BadgeProps> = ({ variant = "default", className, children, ...rest }) => {
  return (
    <span
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...rest}
    >
      {children}
    </span>
  );
};
