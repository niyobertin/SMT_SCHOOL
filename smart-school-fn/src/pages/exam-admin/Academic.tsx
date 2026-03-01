import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    fetchAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    createClassRoom,
    updateClassRoom,
    deleteClassRoom,
    fetchCandidates,
    bulkAssignToClass,
} from '../../redux/features/examAdminSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Calendar,
    Layers,
    Warehouse,
    Building2,
    Users,
    Edit,
    Trash2,
    BookOpen,
    Search,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import SubjectTab from './components/SubjectTab';

const Academic = () => {
    const dispatch = useAppDispatch();
    const {
        academicYears,
        grades,
        candidates,
        loading,
        selectedOrg
    } = useAppSelector((state) => state.examAdmin);
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'years' | 'grades' | 'classrooms' | 'subjects' | 'placement'>('years');
    const [showYearModal, setShowYearModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showPlacementModal, setShowPlacementModal] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [yearFormData, setYearFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        organizationId: '',
    });

    const [gradeFormData, setGradeFormData] = useState({
        name: '',
        level: 1,
        organizationId: '',
    });

    const [classFormData, setClassFormData] = useState({
        name: '',
        gradeId: '',
        organizationId: '',
    });

    const [placementData, setPlacementData] = useState({
        academicYearId: '',
        classRoomId: '',
        studentIds: [] as string[],
        organizationId: '',
    });

    useEffect(() => {
        if (selectedOrg?.id || user?.role === 'SUPER_ADMIN') {
            const orgId = selectedOrg?.id || '';
            dispatch(fetchAcademicYears(orgId));
            dispatch(fetchGrades(orgId));
            dispatch(fetchCandidates(orgId));

            if (selectedOrg?.id) {
                setYearFormData(prev => ({ ...prev, organizationId: selectedOrg.id }));
                setGradeFormData(prev => ({ ...prev, organizationId: selectedOrg.id }));
                setClassFormData(prev => ({ ...prev, organizationId: selectedOrg.id }));
                setPlacementData(prev => ({ ...prev, organizationId: selectedOrg.id }));
            }
        }
    }, [dispatch, selectedOrg, user?.role]);

    const handleYearSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedId) {
                await dispatch(updateAcademicYear({ id: selectedId, data: yearFormData })).unwrap();
                toast.success('Academic Year updated successfully');
            } else {
                await dispatch(createAcademicYear(yearFormData)).unwrap();
                toast.success('Academic Year created successfully');
            }
            setShowYearModal(false);
            setYearFormData({ ...yearFormData, name: '', startDate: '', endDate: '' });
            setIsEditing(false);
            setSelectedId(null);
        } catch (error: any) {
            toast.error(error || 'Failed to save academic year');
        }
    };

    const handleDeleteYear = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this academic year?')) return;
        try {
            await dispatch(deleteAcademicYear(id)).unwrap();
            toast.success('Academic Year deleted');
        } catch (error: any) {
            toast.error(error || 'Failed to delete academic year');
        }
    };

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedId) {
                await dispatch(updateGrade({ id: selectedId, data: gradeFormData })).unwrap();
                toast.success('Grade updated successfully');
            } else {
                await dispatch(createGrade(gradeFormData)).unwrap();
                toast.success('Grade created successfully');
            }
            setShowGradeModal(false);
            setGradeFormData({ ...gradeFormData, name: '', level: 1 });
            setIsEditing(false);
            setSelectedId(null);
        } catch (error: any) {
            toast.error(error || 'Failed to save grade');
        }
    };

    const handleDeleteGrade = async (id: string) => {
        if (!window.confirm('Delete this grade and all its classes?')) return;
        try {
            await dispatch(deleteGrade(id)).unwrap();
            toast.success('Grade deleted');
        } catch (error: any) {
            toast.error(error || 'Failed to delete grade');
        }
    };

    const handleClassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedId) {
                await dispatch(updateClassRoom({ id: selectedId, data: classFormData })).unwrap();
                toast.success('ClassRoom updated successfully');
            } else {
                await dispatch(createClassRoom(classFormData)).unwrap();
                toast.success('ClassRoom created successfully');
            }
            setShowClassModal(false);
            setClassFormData({ ...classFormData, name: '', gradeId: '' });
            setIsEditing(false);
            setSelectedId(null);
        } catch (error: any) {
            toast.error(error || 'Failed to save classroom');
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this classroom?')) return;
        try {
            await dispatch(deleteClassRoom(id)).unwrap();
            toast.success('ClassRoom deleted');
        } catch (error: any) {
            toast.error(error || 'Failed to delete classroom');
        }
    };

    const handleBulkAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(bulkAssignToClass(placementData)).unwrap();
            toast.success('Students assigned successfully');
            setShowPlacementModal(false);
            setPlacementData({ ...placementData, studentIds: [], classRoomId: '' });
        } catch (error: any) {
            toast.error(error || 'Failed to assign students');
        }
    };

    if (!selectedOrg && user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <Building2 className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-xl font-medium">Please select an organization to manage academic records</p>
            </div>
        );
    }

    return (
        <div className="p-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Management</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Configure structure for {selectedOrg ? selectedOrg.name : 'All Organizations'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'years' && (
                        <button
                            disabled={!selectedOrg?.id}
                            title={!selectedOrg?.id ? "Select a specific school to create" : undefined}
                            onClick={() => {
                                setIsEditing(false);
                                setYearFormData({ ...yearFormData, name: '', startDate: '', endDate: '' });
                                setShowYearModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            New Year
                        </button>
                    )}
                    {activeTab === 'grades' && (
                        <button
                            disabled={!selectedOrg?.id}
                            title={!selectedOrg?.id ? "Select a specific school to create" : undefined}
                            onClick={() => {
                                setIsEditing(false);
                                setGradeFormData({ ...gradeFormData, name: '', level: 1 });
                                setShowGradeModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            New Grade
                        </button>
                    )}
                    {activeTab === 'classrooms' && (
                        <button
                            disabled={!selectedOrg?.id}
                            title={!selectedOrg?.id ? "Select a specific school to create" : undefined}
                            onClick={() => {
                                setIsEditing(false);
                                setClassFormData({ ...classFormData, name: '', gradeId: '' });
                                setShowClassModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            New Class
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-6 w-fit overflow-x-auto border border-slate-200 shadow-sm">
                {(['years', 'grades', 'classrooms', 'subjects', 'placement'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap capitalize ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {tab === 'years' ? 'Academic Years' : tab === 'grades' ? 'Grades & Levels' : tab === 'classrooms' ? 'ClassRooms' : tab === 'subjects' ? 'Subjects' : 'Student Placement'}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'years' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Year Name</th>
                                    <th className="px-4 py-3">Start Date</th>
                                    <th className="px-4 py-3">End Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {academicYears.map((year) => (
                                    <tr key={year.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="text-base font-bold text-slate-900">{year.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 font-medium text-sm">{new Date(year.startDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-slate-500 font-medium text-sm">{new Date(year.endDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setSelectedId(year.id);
                                                        setYearFormData({
                                                            name: year.name,
                                                            startDate: new Date(year.startDate).toISOString().split('T')[0],
                                                            endDate: new Date(year.endDate).toISOString().split('T')[0],
                                                            organizationId: selectedOrg.id
                                                        });
                                                        setIsEditing(true);
                                                        setShowYearModal(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteYear(year.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {academicYears.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                                            No academic years found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Grade Level</th>
                                    <th className="px-4 py-3">Order Index</th>
                                    <th className="px-4 py-3">Classrooms</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 rounded-lg">
                                                    <Layers className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <span className="text-base font-bold text-slate-900">{grade.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-slate-500">Lvl {grade.level}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {grade.classRooms?.map((c: any) => (
                                                    <span key={c.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{c.name}</span>
                                                )) || <span className="text-slate-300 italic text-xs">No classes</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setSelectedId(grade.id);
                                                        setGradeFormData({
                                                            name: grade.name,
                                                            level: grade.level,
                                                            organizationId: selectedOrg.id
                                                        });
                                                        setIsEditing(true);
                                                        setShowGradeModal(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGrade(grade.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {grades.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                                            No grades found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'classrooms' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Class Name</th>
                                    <th className="px-4 py-3">Associated Grade</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grades.flatMap(g => (g.classRooms || []).map((cls: any) => ({ ...cls, gradeName: g.name }))).map((cls: any) => (
                                    <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <Warehouse className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <span className="text-base font-bold text-slate-900">{cls.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{cls.gradeName}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setSelectedId(cls.id);
                                                        setClassFormData({
                                                            name: cls.name,
                                                            gradeId: cls.gradeId,
                                                            organizationId: selectedOrg.id
                                                        });
                                                        setIsEditing(true);
                                                        setShowClassModal(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(cls.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {grades.flatMap(g => g.classRooms || []).length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center text-slate-400">
                                            No classrooms found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'subjects' && <SubjectTab />}

                {activeTab === 'placement' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Bulk Assignment</h3>
                                <p className="text-slate-500 text-sm">Select students and assign them to a class.</p>
                            </div>
                            <button
                                onClick={() => setShowPlacementModal(true)}
                                disabled={placementData.studentIds.length === 0 || !selectedOrg?.id}
                                title={!selectedOrg?.id ? "Please select a specific school to assign students" : ""}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 font-bold"
                            >
                                <Users className="w-4 h-4" />
                                Assign {placementData.studentIds.length > 0 ? `${placementData.studentIds.length} Students` : 'Students'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {candidates.map((student) => {
                                const isSelected = placementData.studentIds.includes(student.id);
                                return (
                                    <div
                                        key={student.id}
                                        onClick={() => {
                                            const newIds = isSelected
                                                ? placementData.studentIds.filter(id => id !== student.id)
                                                : [...placementData.studentIds, student.id];
                                            setPlacementData({ ...placementData, studentIds: newIds });
                                        }}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-xs truncate">{student.firstName}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{student.lastName}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showYearModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-1">{isEditing ? 'Edit Year' : 'New Year'}</h3>
                            <p className="text-slate-500 mb-6 text-sm">Configure basic properties for the academic year.</p>

                            <form onSubmit={handleYearSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Year Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={yearFormData.name}
                                        onChange={(e) => setYearFormData({ ...yearFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="e.g. 2025-2026"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={yearFormData.startDate}
                                            onChange={(e) => setYearFormData({ ...yearFormData, startDate: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={yearFormData.endDate}
                                            onChange={(e) => setYearFormData({ ...yearFormData, endDate: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowYearModal(false)} className="flex-1 px-4 py-2 text-slate-500 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-black shadow-sm">
                                        {isEditing ? 'Save' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showGradeModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-1">{isEditing ? 'Edit Grade' : 'New Grade'}</h3>
                            <p className="text-slate-500 mb-6 text-sm">Define a new academic level.</p>

                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Grade Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={gradeFormData.name}
                                        onChange={(e) => setGradeFormData({ ...gradeFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-bold"
                                        placeholder="e.g. Senior One"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Level Order</label>
                                    <input
                                        type="number"
                                        required
                                        value={gradeFormData.level}
                                        onChange={(e) => setGradeFormData({ ...gradeFormData, level: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                        min="1"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowGradeModal(false)} className="flex-1 px-4 py-2 text-slate-500 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-black shadow-sm">
                                        {isEditing ? 'Save' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showClassModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-1">{isEditing ? 'Edit Class' : 'New Class'}</h3>
                            <p className="text-slate-500 mb-6 text-sm">Assign a classroom to a grade level.</p>

                            <form onSubmit={handleClassSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Class Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={classFormData.name}
                                        onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-bold"
                                        placeholder="e.g. 1A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Grade Level</label>
                                    <select
                                        required
                                        value={classFormData.gradeId}
                                        onChange={(e) => setClassFormData({ ...classFormData, gradeId: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                    >
                                        <option value="">Choose Grade...</option>
                                        {grades.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 px-4 py-2 text-slate-500 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-black shadow-sm">
                                        {isEditing ? 'Save' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPlacementModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-1">Assign Students</h3>
                            <p className="text-slate-500 mb-6 text-sm">Place students into specific class & year context.</p>

                            <form onSubmit={handleBulkAssign} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Academic Year</label>
                                    <select
                                        required
                                        value={placementData.academicYearId}
                                        onChange={(e) => setPlacementData({ ...placementData, academicYearId: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                    >
                                        <option value="">Choose Year...</option>
                                        {academicYears.map(y => (
                                            <option key={y.id} value={y.id}>{y.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Classroom</label>
                                    <select
                                        required
                                        value={placementData.classRoomId}
                                        onChange={(e) => setPlacementData({ ...placementData, classRoomId: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold"
                                    >
                                        <option value="">Choose Class...</option>
                                        {grades.flatMap(g => g.classRooms || []).map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name} ({grades.find(g => g.id === cls.gradeId)?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowPlacementModal(false)} className="flex-1 px-4 py-2 text-slate-500 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-black shadow-sm disabled:opacity-50">
                                        {loading ? 'Processing...' : 'Assign'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Academic;
