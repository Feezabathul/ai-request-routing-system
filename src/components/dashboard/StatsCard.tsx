import React from "react";
import { Card } from "@/components/ui/card";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Reusable statistics card used on the dashboard overview.
 * Shows a label and a numeric/value display, optionally with an icon.
 */
export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, className }) => {
  return (
    <Card className={twMerge(clsx("flex items-center space-x-4 p-4", className))}>
      {icon && <div className="text-2xl text-white">{icon}</div>}
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </Card>
  );
};
