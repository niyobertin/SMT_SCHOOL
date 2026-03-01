import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
    fetchStudentsByOrg,
    createStudent,
    // Note: We'll need update/delete student thunks if they exist or use candidate ones if appropriate
    // For now sticking to what exists in academic controller
    deleteCandidate,
    fetchOrganizations,
    fetchGrades,
    fetchAcademicYears
} from '../../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Loader2,
    GraduationCap,
    School,
    Hash,
    UserCircle,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentsTab = () => {
    const dispatch = useAppDispatch();
    const { students, organizations, grades, academicYears, loading, selectedOrg } = useAppSelector((state) => state.examAdmin);
    const { user } = useAppSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const [form, setForm] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        studentCode: '', // School-provided ID
        email: '',
        phoneNumber: '',
        classId: '',
        yearId: '',
        organizationId: ''
    });

    useEffect(() => {
        const orgId = selectedOrg?.id || '';
        dispatch(fetchStudentsByOrg(orgId));
        dispatch(fetchGrades(orgId));
        dispatch(fetchAcademicYears(orgId));

        if (user?.role === 'SUPER_ADMIN') {
            dispatch(fetchOrganizations());
        }

        if (selectedOrg?.id) {
            setForm(prev => ({ ...prev, organizationId: selectedOrg.id }));
        }
    }, [dispatch, selectedOrg, user?.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const orgIdForAction = form.organizationId || selectedOrg?.id;
            if (!orgIdForAction) {
                toast.error('Please select a school/organization');
                return;
            }

            if (!form.studentCode || form.studentCode.trim().length === 0) {
                toast.error('Student Code is required');
                return;
            }

            if (isEditing && selectedStudentId) {
                // Implementation for update student if needed
                toast.info('Update functionality for students coming soon');
            } else {
                // Ensure studentCode is sent as username if missing
                const payload = {
                    ...form,
                    username: form.username || form.studentCode,
                    password: form.password || 'Student123!', // Default password
                };
                await dispatch(createStudent(payload)).unwrap();
                toast.success('Student created successfully');
            }
            setShowModal(false);
            dispatch(fetchStudentsByOrg(selectedOrg?.id));
        } catch (error: any) {
            toast.error(error || 'Failed to save student');
        }
    };

    const handleEdit = (student: any) => {
        setForm({
            username: student.username,
            password: '',
            firstName: student.firstName,
            lastName: student.lastName,
            studentCode: student.academicRecords?.[0]?.studentCode || '',
            email: student.email || '',
            phoneNumber: student.phoneNumber || '',
            classId: student.academicRecords?.[0]?.classId || '',
            yearId: student.academicRecords?.[0]?.yearId || '',
            organizationId: student.userOrganizations?.[0]?.organizationId || ''
        });
        setSelectedStudentId(student.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            // Using deleteCandidate for now as it probably deletes the underlying user/record if linked
            // or we might need a specific deleteStudent
            await dispatch(deleteCandidate(id)).unwrap();
            toast.success('Student deleted');
            dispatch(fetchStudentsByOrg(selectedOrg?.id));
        } catch (error: any) {
            toast.error(error || 'Failed to delete student');
        }
    };

    const filteredStudents = (students || []).filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.academicRecords?.[0]?.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full rounded-lg border-slate-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <button
                    disabled={!selectedOrg?.id && user?.role !== 'SUPER_ADMIN'}
                    onClick={() => {
                        setForm({
                            username: '',
                            password: '',
                            firstName: '',
                            lastName: '',
                            studentCode: '',
                            email: '',
                            phoneNumber: '',
                            classId: '',
                            yearId: academicYears.find(y => y.isActive)?.id || '',
                            organizationId: selectedOrg?.id || ''
                        });
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    New Student
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-10">#</th>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Student Code</th>
                                <th className="px-4 py-3">Class/Grade</th>
                                {user?.role === 'SUPER_ADMIN' && <th className="px-4 py-3">School</th>}
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={user?.role === 'SUPER_ADMIN' ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'SUPER_ADMIN' ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                {student.academicRecords?.[0]?.studentCode || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100 self-start mb-0.5">
                                                    {student.academicRecords?.[0]?.class?.grade?.name || 'No Grade'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {student.academicRecords?.[0]?.class?.name || 'No Class'}
                                                </span>
                                            </div>
                                        </td>
                                        {user?.role === 'SUPER_ADMIN' && (
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {student.userOrganizations?.[0]?.organization?.name || 'Unknown'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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
                                <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Edit Student' : 'New Student'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">First Name</label>
                                        <input
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                                            value={form.firstName}
                                            onChange={e => setForm({ ...form, firstName: e.target.value })}
                                            required
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Last Name</label>
                                        <input
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                                            value={form.lastName}
                                            onChange={e => setForm({ ...form, lastName: e.target.value })}
                                            required
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Student Code</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold"
                                        value={form.studentCode}
                                        onChange={e => setForm({ ...form, studentCode: e.target.value, username: e.target.value })}
                                        required
                                        placeholder="e.g. STU001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Classroom (Grade & Section)</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all font-bold"
                                        value={form.classId}
                                        onChange={e => setForm({ ...form, classId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Classroom</option>
                                        {grades.flatMap(g => (g.classRooms || []).map(cls => ({ ...cls, gradeName: g.name }))).map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.gradeName} - {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Academic Year</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all font-bold"
                                        value={form.yearId}
                                        onChange={e => setForm({ ...form, yearId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {academicYears.map(year => (
                                            <option key={year.id} value={year.id}>
                                                {year.name} {year.isActive ? '(Active)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {user?.role === 'SUPER_ADMIN' && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">School</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all font-bold"
                                            value={form.organizationId}
                                            onChange={e => setForm({ ...form, organizationId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select School</option>
                                            {organizations.map(org => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={form.phoneNumber}
                                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                            placeholder="+250..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-black hover:bg-indigo-700 transition-all shadow-sm text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isEditing ? 'Update student' : 'Create student'}
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

export default StudentsTab;
