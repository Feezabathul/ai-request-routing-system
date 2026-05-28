import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  placeholder = 'Search by title, email, category...',
}) => (
  <div className="relative w-full max-w-md">
    <Input
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-10"
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
);
