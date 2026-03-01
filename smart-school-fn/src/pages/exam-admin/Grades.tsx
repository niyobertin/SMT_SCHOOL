import { useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';
import api from '../../redux/api/api';
import { toast } from 'react-toastify';
import {
    Layers,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    Building,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Grades = () => {
    const { selectedOrganizationId } = useAppSelector((state) => state.auth);
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

    const [gradeForm, setGradeForm] = useState({
        name: '',
        description: ''
    });

    const [classForm, setClassForm] = useState({
        name: '',
        gradeId: ''
    });

    const fetchGrades = async () => {
        if (!selectedOrganizationId) return;
        try {
            setLoading(true);
            const response = await api.get('/academic/grades');
            setGrades(response.data.data);
        } catch (error: any) {
            toast.error('Failed to fetch grades');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, [selectedOrganizationId]);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedGradeId) {
                await api.put(`/academic/grades/${selectedGradeId}`, gradeForm);
                toast.success('Grade updated');
            } else {
                await api.post('/academic/grades', gradeForm);
                toast.success('Grade created');
            }
            setShowGradeModal(false);
            fetchGrades();
        } catch (error: any) {
            toast.error('Failed to save grade');
        }
    };

    const handleClassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/academic/classrooms', classForm);
            toast.success('Class created');
            setShowClassModal(false);
            fetchGrades();
        } catch (error: any) {
            toast.error('Failed to create class');
        }
    };

    const handleDeleteGrade = async (id: string) => {
        if (!window.confirm('Delete this grade and all its classes?')) return;
        try {
            await api.delete(`/academic/grades/${id}`);
            toast.success('Grade deleted');
            fetchGrades();
        } catch (error: any) {
            toast.error('Failed to delete grade');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Layers className="w-8 h-8 text-indigo-600" />
                        Grades & Classes
                    </h1>
                    <p className="text-slate-500 mt-1">Manage levels and individual classrooms</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setGradeForm({ name: '', description: '' });
                            setIsEditing(false);
                            setShowGradeModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        New Grade
                    </button>
                    <button
                        onClick={() => {
                            setClassForm({ name: '', gradeId: '' });
                            setShowClassModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        New Class
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-500 font-medium">Loading academic structure...</p>
                </div>
            ) : grades.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No grades defined yet</h3>
                    <p className="text-slate-500 mb-6">Start by creating your first grade level (e.g. Primary 1, Senior 1)</p>
                    <button
                        onClick={() => setShowGradeModal(true)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                    >
                        Create First Grade
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grades.map((grade) => (
                        <motion.div
                            key={grade.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                        >
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-slate-900">{grade.name}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => {
                                            setGradeForm({ name: grade.name, description: grade.description || '' });
                                            setSelectedGradeId(grade.id);
                                            setIsEditing(true);
                                            setShowGradeModal(true);
                                        }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteGrade(grade.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">{grade.description || 'No description'}</p>
                            </div>
                            <div className="p-4 flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Classrooms</p>
                                <div className="space-y-1">
                                    {grade.classRooms?.length > 0 ? (
                                        grade.classRooms.map((cls: any) => (
                                            <div key={cls.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <Building className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">{cls.name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-4 text-sm text-slate-400 italic">No classes assigned</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Grade Modal */}
            <AnimatePresence>
                {showGradeModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Grade' : 'Create Grade'}</h3>
                                <button onClick={() => setShowGradeModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Grade Name</label>
                                    <input className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={gradeForm.name} onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })} required placeholder="e.g. Senior One" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" rows={3} value={gradeForm.description} onChange={e => setGradeForm({ ...gradeForm, description: e.target.value })} placeholder="e.g. Lower Secondary Level" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowGradeModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200">{isEditing ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Class Modal */}
            <AnimatePresence>
                {showClassModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Create Class</h3>
                                <button onClick={() => setShowClassModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleClassSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Class Name</label>
                                    <input className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required placeholder="e.g. Section A" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Assign to Grade</label>
                                    <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all" value={classForm.gradeId} onChange={e => setClassForm({ ...classForm, gradeId: e.target.value })} required>
                                        <option value="">Select Grade</option>
                                        {grades.map(grade => (
                                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Create Class</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Grades;
