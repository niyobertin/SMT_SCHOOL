import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchGrades
} from '../../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectTab = () => {
    const dispatch = useAppDispatch();
    const { subjects, grades, loading, selectedOrg } = useAppSelector((state) => state.examAdmin);
    const { user } = useAppSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        gradeId: '',
        isActive: true,
        organizationId: ''
    });

    useEffect(() => {
        if (selectedOrg?.id || user?.role === 'SUPER_ADMIN') {
            const orgId = selectedOrg?.id || '';
            dispatch(fetchSubjects(orgId));
            dispatch(fetchGrades(orgId));
            if (selectedOrg?.id) {
                setForm(prev => ({ ...prev, organizationId: selectedOrg.id }));
            }
        }
    }, [dispatch, selectedOrg, user?.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedSubjectId) {
                await dispatch(updateSubject({ id: selectedSubjectId, data: form })).unwrap();
                toast.success('Subject updated');
            } else {
                await dispatch(createSubject(form)).unwrap();
                toast.success('Subject created');
            }
            setShowModal(false);
        } catch (error: any) {
            toast.error(error || 'Failed to save subject');
        }
    };

    const handleEdit = (subject: any) => {
        setForm({
            name: subject.name,
            code: subject.code,
            description: subject.description || '',
            gradeId: subject.gradeId,
            isActive: subject.isActive,
            organizationId: selectedOrg?.id || ''
        });
        setSelectedSubjectId(subject.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await dispatch(deleteSubject(id)).unwrap();
            toast.success('Subject deleted');
        } catch (error: any) {
            toast.error(error || 'Failed to delete subject');
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full rounded-lg border-slate-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <button
                    disabled={!selectedOrg?.id}
                    title={!selectedOrg?.id ? "Select a specific school to create a subject" : undefined}
                    onClick={() => {
                        setForm({ name: '', code: '', description: '', gradeId: '', isActive: true, organizationId: selectedOrg?.id || '' });
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    New Subject
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Subject Name</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Grade</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                                        Loading subjects...
                                    </td>
                                </tr>
                            ) : filteredSubjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No subjects found
                                    </td>
                                </tr>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                                </div>
                                                <span className="font-semibold text-slate-900">{subject.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{subject.code}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                                {subject.grade?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {subject.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                                                    <XCircle className="w-2.5 h-2.5" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(subject)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(subject.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-4 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Subject' : 'Create Subject'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Name</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Code</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono transition-all uppercase"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value })}
                                        required
                                        placeholder="e.g. MATH101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Grade Level</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                                        value={form.gradeId}
                                        onChange={e => setForm({ ...form, gradeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map(grade => (
                                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief details about the subject..."
                                    />
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">Active Subject</label>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-sm text-sm"
                                    >
                                        {isEditing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubjectTab;
