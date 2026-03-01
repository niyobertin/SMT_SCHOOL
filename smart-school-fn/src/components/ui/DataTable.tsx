import { type ReactNode } from 'react';
import { FileText, Loader2 } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

export interface Column<T> {
    header: string;
    key: string;
    render?: (item: T) => ReactNode;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
    skeletonCount?: number;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading,
    onRowClick,
    emptyMessage = "No data found",
    emptyIcon = <FileText className="w-12 h-12 text-slate-200 mb-3" />,
    skeletonCount = 5
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                        <tr>
                            {columns.map((column, idx) => (
                                <th key={idx} className={`px-4 py-3 text-left uppercase tracking-wider ${column.headerClassName || ''}`}>
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                                    <span>Loading...</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 shadow-sm">
                {emptyIcon}
                <p className="font-bold text-sm uppercase tracking-widest">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                    <tr>
                        {columns.map((column, idx) => (
                            <th key={idx} className={`px-4 py-3 text-left uppercase tracking-wider ${column.headerClassName || ''}`}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick?.(item)}
                            className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
                        >
                            {columns.map((column, idx) => (
                                <td key={idx} className={`px-4 py-3 font-medium ${column.className || ''}`}>
                                    {column.render ? column.render(item) : (item as any)[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
