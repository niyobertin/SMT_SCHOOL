import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';

const examSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    passingScore: z.number().min(1).max(100),
    maxAttempts: z.number().min(1).max(10),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    instructions: z.string().optional(),
    startDate: z.string().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ExamFormData) => void;
    initialData?: any;
    loading?: boolean;
    isEditing?: boolean;
}

export const ExamFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading,
    isEditing
}: ExamFormModalProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
        defaultValues: initialData || {
            title: '',
            description: '',
            duration: 60,
            passingScore: 70,
            maxAttempts: 3,
            status: 'DRAFT',
            instructions: '',
            startDate: '',
        }
    });

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
                Cancel
            </button>
            <button
                type="submit"
                form="exam-form"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest"
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Update Exam' : 'Create Exam'}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Examination' : 'Create New Examination'}
            description="Configure your entrance exam settings and scheduling."
            footer={footer}
            size="md"
        >
            <form id="exam-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Title</label>
                    <input
                        {...register('title')}
                        className={`w-full border rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                        placeholder="e.g., Mathematics Midterm 2024"
                    />
                    {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                        <select
                            {...register('status')}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pass Score (%)</label>
                        <input
                            type="number"
                            {...register('passingScore', { valueAsNumber: true })}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                        {...register('description')}
                        rows={2}
                        className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-medium"
                        placeholder="Brief overview of what this exam covers..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (min)</label>
                        <input
                            type="number"
                            {...register('duration', { valueAsNumber: true })}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Attempts</label>
                        <input
                            type="number"
                            {...register('maxAttempts', { valueAsNumber: true })}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                    <textarea
                        {...register('instructions')}
                        rows={3}
                        className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        placeholder="One instruction per line..."
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase">These will appear as bullet points for students.</p>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Start (Optional)</label>
                    <input
                        type="datetime-local"
                        {...register('startDate')}
                        className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-sans font-bold"
                    />
                </div>
            </form>
        </Modal>
    );
};
