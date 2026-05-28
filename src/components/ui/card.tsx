import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable dashboard card with glassmorphism styling.
 * Accepts optional header and footer sections.
 */
export const Card: React.FC<CardProps> = ({ header, footer, children, className }) => {
  const base = "bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 rounded-xl shadow-sm p-6";
  return (
    <div className={twMerge(clsx(base, className))}>
      {header && <div className="mb-4 border-b border-gray-300 pb-2 text-lg font-medium text-white">{header}</div>}
      <div className="text-white">{children}</div>
      {footer && <div className="mt-4 border-t border-gray-300 pt-2 text-sm text-gray-300">{footer}</div>}
    </div>
  );
};
