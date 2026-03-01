import { useState } from 'react';
import { Plus, Edit, Trash2, HelpCircle, Upload, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Modal } from '../../../../components/ui/Modal';

interface QuestionManagerProps {
    isOpen: boolean;
    onClose: () => void;
    exam: any;
    onAddQuestion: (data: any) => Promise<void>;
    onUpdateQuestion: (qId: string, data: any) => Promise<void>;
    onDeleteQuestion: (qId: string) => Promise<void>;
    onBulkAdd: (questions: any[]) => Promise<void>;
    loading?: boolean;
}

export const QuestionManager = ({
    isOpen,
    onClose,
    exam,
    onAddQuestion,
    onUpdateQuestion,
    onDeleteQuestion,
    onBulkAdd,
    loading
}: QuestionManagerProps) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [questionForm, setQuestionForm] = useState({
        question: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        explanation: '',
        options: [{ option: '', isCorrect: false }, { option: '', isCorrect: false }],
    });

    const resetForm = () => {
        setQuestionForm({
            question: '', type: 'MULTIPLE_CHOICE', points: 1, explanation: '',
            options: [{ option: '', isCorrect: false }, { option: '', isCorrect: false }]
        });
        setEditingQuestion(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingQuestion) {
                await onUpdateQuestion(editingQuestion.id, questionForm);
            } else {
                await onAddQuestion(questionForm);
            }
            setViewMode('LIST');
            resetForm();
        } catch (error: any) {
            toast.error(error);
        }
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                const formatted = data.map((row: any) => ({
                    question: row.Question || 'Untitled Question',
                    type: (row.Type || 'MULTIPLE_CHOICE').toString().toUpperCase().replace(/\s+/g, '_'),
                    points: Number(row.Points || 1),
                    explanation: row.Explanation || '',
                    options: (row.Options || '').split('|').map((optStr: string) => {
                        const parts = optStr.split(',');
                        return { option: parts[0]?.trim(), isCorrect: parts[1]?.trim().toLowerCase() === 'true' };
                    }).filter((o: any) => o.option)
                }));

                await onBulkAdd(formatted);
                toast.success(`Uploaded ${formatted.length} questions`);
            } catch (err) {
                toast.error('Invalid Excel format');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const footer = (
        <div className="flex justify-between items-center w-full">
            <button
                onClick={() => viewMode === 'LIST' ? onClose() : setViewMode('LIST')}
                className="px-5 py-2 text-sm font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
                {viewMode === 'LIST' ? 'Close Manager' : <><ChevronLeft className="w-4 h-4" /> Back to List</>}
            </button>
            {viewMode === 'FORM' && (
                <button
                    type="submit"
                    form="q-form"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase tracking-widest"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Question
                </button>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Question Bank"
            description={viewMode === 'LIST' ? `Managing ${exam?.questions?.length || 0} items for ${exam.title}` : 'Creating assessment item'}
            footer={footer}
            size="lg"
            className="h-[85vh]"
        >
            {viewMode === 'LIST' ? (
                <div className="space-y-6">
                    <div className="flex gap-3">
                        <button
                            onClick={() => { resetForm(); setViewMode('FORM'); }}
                            className="flex-1 bg-white border-2 border-slate-100 text-indigo-600 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" /> Single Question
                        </button>
                        <div className="relative flex-1">
                            <input type="file" onChange={handleExcelUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" disabled={loading} />
                            <button className="w-full h-full bg-slate-100 text-slate-600 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50 uppercase tracking-widest">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Bulk Import
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {exam.questions?.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <HelpCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">The question bank is empty</p>
                            </div>
                        ) : (
                            exam.questions?.map((q: any) => (
                                <div key={q.id} className="p-5 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-md transition-all group relative bg-white">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">{q.type}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q.points} Points</span>
                                            </div>
                                            <p className="text-sm text-slate-900 font-bold mt-2 leading-relaxed">{q.question}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button onClick={() => { setEditingQuestion(q); setQuestionForm(q); setViewMode('FORM'); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDeleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <form id="q-form" onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                        <textarea
                            required
                            value={questionForm.question}
                            onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] font-bold"
                            placeholder="Type your question here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Response Type</label>
                            <select
                                value={questionForm.type}
                                onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })}
                                className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            >
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="TRUE_FALSE">True/False</option>
                                <option value="ESSAY">Essay / Open Ended</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Point Value</label>
                            <input
                                type="number"
                                value={questionForm.points}
                                onChange={e => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                                className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>
                    </div>

                    {questionForm.type !== 'ESSAY' && (
                        <div className="space-y-4 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Response Options</label>
                            <div className="space-y-3">
                                {questionForm.options.map((opt, oi) => (
                                    <div key={oi} className="flex gap-3 items-center group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={opt.isCorrect}
                                                onChange={(e) => {
                                                    const newOpts = [...questionForm.options];
                                                    newOpts[oi].isCorrect = e.target.checked;
                                                    setQuestionForm({ ...questionForm, options: newOpts });
                                                }}
                                                className="w-5 h-5 rounded-lg text-indigo-600 border-slate-200 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            value={opt.option}
                                            placeholder={`Option ${oi + 1}`}
                                            onChange={(e) => {
                                                const newOpts = [...questionForm.options];
                                                newOpts[oi].option = e.target.value;
                                                setQuestionForm({ ...questionForm, options: newOpts });
                                            }}
                                            className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm outline-none transition-all font-bold ${opt.isCorrect ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-slate-50/50 border-slate-100'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setQuestionForm({ ...questionForm, options: questionForm.options.filter((_, idx) => idx !== oi) })}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, { option: '', isCorrect: false }] })}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest ml-1"
                            >
                                + Add Another Option
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation (Optional)</label>
                        <textarea
                            value={questionForm.explanation}
                            onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                            className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            rows={3}
                            placeholder="Provide details about the correct answer..."
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
};
