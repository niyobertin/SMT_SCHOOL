import { Plus, Trash2, BookOpen, Users, User, X, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import type { AppDispatch, RootState } from "../../../redux/stores";
import { Toast } from 'primereact/toast';
import {
    fetchAssignments, createAssignment, deleteAssignment,
    fetchClasses, fetchAcademicYears
} from "../../../redux/features/academic/academicSlice";
import { fetchCourses } from "../../../redux/features/courses/courseSlice";
import api from "../../../redux/api/api";

export const CourseAssignmentSection = () => {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);

    const { assignments, classes, loading } = useSelector((state: RootState) => state.academic);
    const { items: courses } = useSelector((state: RootState) => state.courses);
    const { user } = useSelector((state: RootState) => state.auth);
    const schoolId = user?.schoolStaff?.[0]?.schoolId || user?.userOrganizations?.[0]?.organizationId;

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchAssignments(schoolId));
            dispatch(fetchClasses({ schoolId }));
            dispatch(fetchAcademicYears(schoolId));
            dispatch(fetchCourses({ page: 1, limit: 100 }));
        }
    }, [dispatch, schoolId]);

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteAssignment(id)).unwrap();
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Assignment removed', life: 3000 });
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to remove', life: 3000 });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-0">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Course Access</h1>
                    <p className="text-slate-500 font-medium mt-3">Assign curriculum content to specific classes or individual students.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                >
                    <Plus size={16} />
                    Create Assignment
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment: any) => (
                    <motion.div
                        key={assignment.id}
                        layout
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-[#1a7ea5] rounded-xl">
                                <BookOpen size={20} />
                            </div>
                            <button
                                onClick={() => handleDelete(assignment.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{assignment.course?.title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Course Material</p>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                            {assignment.class ? (
                                <>
                                    <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                        <Users size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{assignment.class?.name}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Class Assignment</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                        <User size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{assignment.student?.firstName} {assignment.student?.lastName}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Personal Assignment</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}

                {assignments.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center">
                        <CheckCircle size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No active assignments</p>
                    </div>
                )}
            </div>

            {showModal && (
                <AssignmentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        dispatch(fetchAssignments(schoolId));
                        setShowModal(false);
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Course assigned!', life: 3000 });
                    }}
                    schoolId={schoolId}
                    courses={courses}
                    classes={classes}
                />
            )}
        </motion.div>
    );
};

const AssignmentModal = ({ onClose, onSuccess, schoolId, courses, classes }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<any>({ type: 'class' });
    const [students, setStudents] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.type === 'student') {
            api.get(`/schools/${schoolId}/students`).then(res => setStudents(res.data.data));
        }
    }, [formData.type, schoolId]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                courseId: formData.courseId,
                classId: formData.type === 'class' ? formData.targetId : null,
                studentId: formData.type === 'student' ? formData.targetId : null,
            };
            await dispatch(createAssignment({ schoolId, data: payload })).unwrap();
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
                <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Assign Course</h3>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Select Course</label>
                        <select onChange={e => setFormData({ ...formData, courseId: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all">
                            <option value="">Select Course</option>
                            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'class' ? 'bg-white text-[#1a7ea5] shadow-sm' : 'text-slate-400'}`}
                            onClick={() => setFormData({ ...formData, type: 'class', targetId: '' })}
                        >Class</button>
                        <button
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'student' ? 'bg-white text-[#1a7ea5] shadow-sm' : 'text-slate-400'}`}
                            onClick={() => setFormData({ ...formData, type: 'student', targetId: '' })}
                        >Student</button>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">
                            Assign to {formData.type === 'class' ? 'Class' : 'Student'}
                        </label>
                        <select onChange={e => setFormData({ ...formData, targetId: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all">
                            <option value="">Select {formData.type === 'class' ? 'Class' : 'Student'}</option>
                            {formData.type === 'class' ?
                                classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>) :
                                students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>)
                            }
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.courseId || !formData.targetId}
                        className="w-full py-5 bg-[#1a7ea5] text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40"
                    >
                        {isSubmitting ? "Processing..." : "Confirm Assignment"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
