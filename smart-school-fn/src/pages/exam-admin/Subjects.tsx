import { useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';
import api from '../../redux/api/api';
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

const Subjects = () => {
    const { selectedOrganizationId } = useAppSelector((state) => state.auth);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        gradeId: '',
        isActive: true
    });

    const fetchSubjects = async () => {
        if (!selectedOrganizationId) return;
        try {
            setLoading(true);
            const response = await api.get('/academic/subjects');
            setSubjects(response.data.data);
        } catch (error: any) {
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async () => {
        if (!selectedOrganizationId) return;
        try {
            const response = await api.get('/academic/grades');
            setGrades(response.data.data);
        } catch (error: any) {
            console.error('Failed to fetch grades');
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchGrades();
    }, [selectedOrganizationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedSubjectId) {
                await api.put(`/academic/subjects/${selectedSubjectId}`, form);
                toast.success('Subject updated');
            } else {
                await api.post('/academic/subjects', form);
                toast.success('Subject created');
            }
            setShowModal(false);
            fetchSubjects();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save subject');
        }
    };

    const handleEdit = (subject: any) => {
        setForm({
            name: subject.name,
            code: subject.code,
            description: subject.description || '',
            gradeId: subject.gradeId,
            isActive: subject.isActive
        });
        setSelectedSubjectId(subject.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/academic/subjects/${id}`);
            toast.success('Subject deleted');
            fetchSubjects();
        } catch (error: any) {
            toast.error('Failed to delete subject');
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Subjects
                    </h1>
                    <p className="text-slate-500 mt-1">Manage academic subjects for your school</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ name: '', code: '', description: '', gradeId: '', isActive: true });
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Create Subject
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full rounded-lg border-slate-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200 uppercase tracking-wider">
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
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                                        <span>Loading subjects...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredSubjects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    No subjects found
                                </td>
                            </tr>
                        ) : (
                            filteredSubjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-slate-900">{subject.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{subject.code}</td>
                                    <td className="px-4 py-3">{subject.grade?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        {subject.isActive ? (
                                            <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                                <CheckCircle2 className="w-4 h-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                <XCircle className="w-4 h-4" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5 transition-all">
                                            <button onClick={() => handleEdit(subject)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(subject.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all">
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

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Subject' : 'Create Subject'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Name</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Code</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono transition-all"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value })}
                                        required
                                        placeholder="e.g. MATH101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Grade</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">Active Subject</label>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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

export default Subjects;
