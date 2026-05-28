import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WelcomeSectionProps {
  userName: string;
  role: string;
  description?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  role,
  description = 'Welcome to the AI Request Routing dashboard.',
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hello, {userName}!</h1>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 mt-1">{role}</Badge>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search…"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="w-8 h-8 bg-gray-300 rounded-full" />{/* avatar placeholder */}
        <div className="w-5 h-5 bg-gray-300 rounded-full" />{/* notification placeholder */}
      </div>
    </header>
  );
};
