import { Search, Filter, ChevronDown } from 'lucide-react';
import type { ExamFilters as FilterState } from '../../../../hooks/useExams';

interface ExamFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export const ExamFilters = ({ filters, setFilters }: ExamFiltersProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search exams..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 w-full rounded-lg border-slate-200 border py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
            </div>

            {/* Status Filter */}
            <div className="relative md:col-span-2">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="pl-10 w-full rounded-lg border-slate-200 border py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition-all pr-10"
                >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Archived Checkbox */}
            <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors w-full border border-transparent hover:border-slate-100">
                    <input
                        type="checkbox"
                        checked={filters.archived || false}
                        onChange={(e) => setFilters({ ...filters, archived: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-600">Include Archived</span>
                </label>
            </div>
        </div>
    );
};
