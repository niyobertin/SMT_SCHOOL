import { FileText, Copy, Clock, Edit, Archive, Undo, Trash2, UserPlus } from 'lucide-react';
import { DataTable, type Column } from '../../../../components/ui/DataTable';

interface ExamTableProps {
    exams: any[];
    loading: boolean;
    onEdit: (exam: any) => void;
    onDelete: (examId: string) => void;
    onArchive: (exam: any) => void;
    onManageQuestions: (examId: string) => void;
    onAssignCandidates: (exam: any) => void;
    onCopyCode: (code: string) => void;
}

export const ExamTable = ({
    exams,
    loading,
    onEdit,
    onDelete,
    onArchive,
    onManageQuestions,
    onAssignCandidates,
    onCopyCode
}: ExamTableProps) => {
    const columns: Column<any>[] = [
        {
            header: "Exam Title",
            key: "title",
            render: (exam) => (
                <div className="py-1">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{exam.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                        <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono tracking-tight border border-slate-200/50">{exam.examCode}</code>
                        <button onClick={(e) => { e.stopPropagation(); onCopyCode(exam.examCode); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded">
                            <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                    </div>
                </div>
            )
        },
        {
            header: "Organization",
            key: "organization",
            render: (exam) => <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{exam.organization?.name || 'N/A'}</span>
        },
        {
            header: "Duration",
            key: "duration",
            render: (exam) => (
                <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {exam.duration}m
                </div>
            )
        },
        {
            header: "Questions",
            key: "questions",
            headerClassName: "text-center",
            className: "text-center",
            render: (exam) => <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs border border-slate-200/50">{exam._count?.questions || 0}</span>
        },
        {
            header: "Status",
            key: "status",
            headerClassName: "text-center",
            className: "text-center",
            render: (exam) => (
                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${exam.status === 'PUBLISHED'
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {exam.status}
                </span>
            )
        },
        {
            header: "Actions",
            key: "actions",
            headerClassName: "text-right",
            className: "text-right",
            render: (exam) => (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => onEdit(exam)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onManageQuestions(exam.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Questions">
                        <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => onAssignCandidates(exam)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Assign">
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button onClick={() => onArchive(exam)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title={exam.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}>
                        {exam.status === 'ARCHIVED' ? <Undo className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onDelete(exam.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DataTable
            data={exams}
            columns={columns}
            loading={loading}
            emptyMessage="No examinations found"
        />
    );
};
