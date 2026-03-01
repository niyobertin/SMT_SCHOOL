import { useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';
import api from '../../redux/api/api';
import { toast } from 'react-toastify';
import {
    UserPlus,
    Plus,
    Trash2,
    X,
    Loader2,
    User,
    Book,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Assignments = () => {
    const { selectedOrganizationId } = useAppSelector((state) => state.auth);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        teacherId: '',
        classId: '',
        subjectId: '',
        yearId: ''
    });

    const fetchData = async () => {
        if (!selectedOrganizationId) return;
        try {
            setLoading(true);
            const [assignRes, subRes, gradeRes, yearRes] = await Promise.all([
                api.get('/academic/teacher-assignments'),
                api.get('/academic/subjects'),
                api.get('/academic/grades'),
                api.get('/academic/years')
            ]);
            setAssignments(assignRes.data.data);
            setSubjects(subRes.data.data);
            setGrades(gradeRes.data.data);
            setYears(yearRes.data.data);
        } catch (error: any) {
            toast.error('Failed to fetch assignment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Fetch users with instructor role
        const fetchInstructors = async () => {
            try {
                const res = await api.get('/users');
                const instructors = res.data.data.users.filter((u: any) => u.role === 'INSTRUCTOR');
                setTeachers(instructors);
            } catch (e) { }
        };
        fetchInstructors();
    }, [selectedOrganizationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post('/academic/teacher-assignments', form);
            toast.success('Teacher assigned successfully');
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this assignment?')) return;
        try {
            await api.delete(`/academic/teacher-assignments/${id}`);
            toast.success('Assignment removed');
            fetchData();
        } catch (error: any) {
            toast.error('Failed to remove assignment');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-indigo-600" />
                        Teacher Assignments
                    </h1>
                    <p className="text-slate-500 mt-1">Assign teachers to classes and subjects</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ teacherId: '', classId: '', subjectId: '', yearId: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    New Assignment
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Teacher</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                                        <span>Loading assignments...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : assignments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No assignments found.
                                </td>
                            </tr>
                        ) : (
                            assignments.map((as) => (
                                <tr key={as.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{as.teacher?.firstName} {as.teacher?.lastName}</p>
                                                <p className="text-xs text-slate-500">{as.teacher?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Book className="w-4 h-4 text-indigo-400" />
                                            <span className="font-medium">{as.subject?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-slate-400" />
                                            <span>{as.class?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                            {as.academicYear?.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(as.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">New Teacher Assignment</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Teacher</label>
                                    <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} required>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Subject</label>
                                    <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Class</label>
                                    <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
                                        <option value="">Select Class</option>
                                        {grades.flatMap(g => g.classRooms || []).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} ({grades.find(g => g.id === c.gradeId)?.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
                                    <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={form.yearId} onChange={e => setForm({ ...form, yearId: e.target.value })} required>
                                        <option value="">Select Year</option>
                                        {years.map(y => (
                                            <option key={y.id} value={y.id}>{y.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" disabled={submitting}>Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {submitting ? 'Assigning...' : 'Assign Teacher'}
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

export default Assignments;
