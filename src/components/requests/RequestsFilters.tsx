import React from 'react';
import { Badge } from '@/components/ui/badge';

export interface FiltersState {
  status: string;
  priority: string;
  category: string;
  agent: string;
}

interface RequestsFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

export const RequestsFilters: React.FC<RequestsFiltersProps> = ({ filters, setFilters }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', category: '', agent: '' });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="rounded border-gray-300 p-2"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="AI Processing">AI Processing</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>
      <select
        name="priority"
        value={filters.priority}
        onChange={handleChange}
        className="rounded border-gray-300 p-2"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Urgent">Urgent</option>
      </select>
      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="rounded border-gray-300 p-2"
      >
        <option value="">All Categories</option>
        <option value="Support">Support</option>
        <option value="Bug">Bug</option>
        <option value="Feature">Feature</option>
      </select>
      <select
        name="agent"
        value={filters.agent}
        onChange={handleChange}
        className="rounded border-gray-300 p-2"
      >
        <option value="">All Agents</option>
        <option value="Alice">Alice</option>
        <option value="Bob">Bob</option>
        <option value="Charlie">Charlie</option>
      </select>
      <button
        onClick={clearFilters}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Clear Filters
      </button>
    </div>
  );
};
