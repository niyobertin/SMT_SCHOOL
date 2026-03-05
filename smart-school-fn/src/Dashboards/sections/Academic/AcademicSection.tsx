import { Plus, Edit, Calendar, Users, BookOpen, X, GraduationCap, Trash2, CheckCircle2, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { AppDispatch, RootState } from "../../../redux/stores";
import { Toast } from 'primereact/toast';
import api from "../../../redux/api/api";
import * as XLSX from "xlsx";
import {
    fetchAcademicYears, createAcademicYear,
    fetchClasses, createClass,
    fetchSubjects, createSubject
} from "../../../redux/features/academic/academicSlice";

type Tab = "years" | "classes" | "subjects" | "students";

interface Student {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    gender?: string;
    status: string;
    class?: { id: string; name: string } | null;
    academicYear?: { id: string; year: string } | null;
    school?: { id: string; name: string; code: string } | null;
    createdAt: string;
}

export const AcademicSection = () => {
    const [activeTab, setActiveTab] = useState<Tab>("years");
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);

    // Students state
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");

    const { years, classes, subjects, selectedYearId } = useSelector((state: RootState) => state.academic);
    const { user } = useSelector((state: RootState) => state.auth);
    const userRole = localStorage.getItem("userRole");
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
    const schoolId = user?.schoolStaff?.[0]?.schoolId || user?.userOrganizations?.[0]?.organizationId;

    const fetchStudents = useCallback(async () => {
        if (!schoolId) return;
        setStudentsLoading(true);
        try {
            const { data } = await api.get(`/schools/${schoolId}/students`, {
                params: {
                    q: studentSearch || undefined,
                    academicYearId: selectedYearId || undefined
                },
            });
            setStudents(data.data || data.students || []);
        } catch {
            toast.current?.show({ severity: "error", summary: "error", detail: "failed to load students", life: 3000 });
        } finally {
            setStudentsLoading(false);
        }
    }, [schoolId, studentSearch, selectedYearId]);

    useEffect(() => {
        if (schoolId) {
            if (activeTab === "years") dispatch(fetchAcademicYears(schoolId));
            if (activeTab === "classes") dispatch(fetchClasses({ schoolId, academicYearId: selectedYearId || undefined }));
            if (activeTab === "subjects") dispatch(fetchSubjects(schoolId));
            if (activeTab === "students") fetchStudents();
        }
    }, [dispatch, schoolId, activeTab, fetchStudents, selectedYearId]);

    const handleCreateSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'success', detail: message, life: 3000 });
        setShowModal(false);
        if (activeTab === "students") fetchStudents();
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("are you sure you want to remove this student?")) return;
        try {
            await api.delete(`/schools/${schoolId}/students/${id}`);
            toast.current?.show({ severity: "success", summary: "removed", detail: "student removed", life: 3000 });
            fetchStudents();
        } catch {
            toast.current?.show({ severity: "error", summary: "error", detail: "failed to remove student", life: 3000 });
        }
    };

    const tabs = [
        { id: "years", label: "years", icon: Calendar },
        { id: "classes", label: "classes", icon: Users },
        { id: "subjects", label: "subjects", icon: BookOpen },
        { id: "students", label: "students", icon: GraduationCap },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-0"
        >
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">academic setup</h1>
                    <p className="text-slate-500 font-medium mt-3">manage years, classes, subjects and students for your school.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && activeTab === "students" && (
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Upload size={16} />
                            bulk upload
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                        >
                            <Plus size={16} />
                            {activeTab === "years" ? "new year" : activeTab === "classes" ? "new class" : activeTab === "subjects" ? "new subject" : "add student"}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit border border-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white text-[#1a7ea5] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        onClick={() => setActiveTab(tab.id as Tab)}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Students Tab Content */}
            {activeTab === "students" && (
                <div className="space-y-4">
                    <div className="relative group flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="search by name or id..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">student</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">id</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">class</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">sch. code</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">year</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">status</th>
                                        {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {studentsLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <GraduationCap className="mx-auto mb-3 text-slate-200" size={48} />
                                                <p className="text-slate-400 font-medium">no students found.</p>
                                                <p className="text-slate-300 text-sm mt-1">add your first student to get started.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            {students.map((student, idx) => (
                                                <motion.tr
                                                    key={student.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="hover:bg-slate-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-xl bg-[#1a7ea5]/10 text-[#1a7ea5] flex items-center justify-center font-bold text-sm">
                                                                {student.firstName[0]}{student.lastName?.[0] || ""}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                                                                <p className="text-[11px] text-slate-400">{student.email || student.phoneNumber || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#1a7ea5]">{student.studentId}</td>
                                                    <td className="px-5 py-4 text-sm text-slate-500">{student.class?.name || "—"}</td>
                                                    <td className="px-5 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tight">{student.school?.code || "—"}</td>
                                                    <td className="px-5 py-4 text-sm text-slate-500">{student.academicYear?.year || "—"}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                            {student.status === "ACTIVE" && <CheckCircle2 size={10} />}
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedStudent(student);
                                                                        setShowAssignModal(true);
                                                                    }}
                                                                    className="p-2 text-slate-500 hover:text-[#1a7ea5] bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm flex items-center gap-2 px-3"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">assign class</span>
                                                                </button>
                                                                <button className="p-2 text-slate-500 hover:text-[#1a7ea5] bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm">
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteStudent(student.id)}
                                                                    className="p-2 text-slate-500 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-xl transition-all shadow-sm"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Other tabs content */}
            {activeTab !== "students" && (
                <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        {activeTab === "years" ? "academic year" : activeTab === "classes" ? "class name" : "subject name"}
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        {activeTab === "years" ? "duration" : activeTab === "classes" ? "level / stream" : "code"}
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTab === "years" && years.map((year: any) => (
                                    <tr key={year.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{year.year}</td>
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${year.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {year.isActive ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {isAdmin && <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>}
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "classes" && classes.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{c.name}</td>
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {c.level || 'n/a'} {c.stream ? `/ ${c.stream}` : ''}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs font-bold text-slate-400">
                                                {c._count?.students || 0} students
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {isAdmin && <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>}
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "subjects" && subjects.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{s.name}</td>
                                        <td className="px-6 py-5 text-sm font-black text-[#1a7ea5] uppercase">{s.code || '---'}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">global link</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {isAdmin && <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <CreateAcademicModal
                    type={activeTab}
                    schoolId={schoolId}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleCreateSuccess}
                    academicYears={years}
                    classes={classes}
                />
            )}

            {/* Bulk Modal */}
            {showBulkModal && (
                <BulkImportModal
                    schoolId={schoolId}
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={() => {
                        handleCreateSuccess("bulk import completed!");
                        setShowBulkModal(false);
                    }}
                    classes={classes}
                    academicYears={years}
                />
            )}

            {/* Assign Class Modal */}
            {showAssignModal && selectedStudent && (
                <AssignClassModal
                    schoolId={schoolId}
                    student={selectedStudent}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedStudent(null);
                    }}
                    onSuccess={() => {
                        handleCreateSuccess("student assigned successfully!");
                        fetchStudents();
                    }}
                    classes={classes}
                    academicYears={years}
                />
            )}
        </motion.div>
    );
};

// ─── Create Academic / Student Modal ──────────────────────────────────────────
const CreateAcademicModal = ({ type, schoolId, onClose, onSuccess, academicYears, classes }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const set = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            if (type === "years") {
                await dispatch(createAcademicYear({ schoolId, data: formData })).unwrap();
                onSuccess("academic year created!");
                dispatch(fetchAcademicYears(schoolId));
            } else if (type === "classes") {
                await dispatch(createClass({ schoolId, data: formData })).unwrap();
                onSuccess("class created!");
                dispatch(fetchClasses({ schoolId }));
            } else if (type === "subjects") {
                await dispatch(createSubject({ schoolId, data: formData })).unwrap();
                onSuccess("subject created!");
                dispatch(fetchSubjects(schoolId));
            } else if (type === "students") {
                if (!formData.firstName) {
                    setError("first name is required.");
                    setIsSubmitting(false);
                    return;
                }
                await api.post(`/schools/${schoolId}/students`, formData);
                onSuccess("student created successfully!");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-1";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                    <X size={20} />
                </button>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                    {type === "years" ? "new year" : type === "classes" ? "new class" : type === "subjects" ? "new subject" : "add student"}
                </h3>
                <p className="text-slate-400 text-sm mb-8">
                    {type === "students" ? "fill in the student details. id is optional." : "fill in the details below."}
                </p>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    {/* ── YEARS ── */}
                    {type === "years" && (
                        <>
                            <div>
                                <label className={labelCls}>year name</label>
                                <select onChange={e => set("year", e.target.value)} className={inputCls}>
                                    <option value="">select academic year</option>
                                    {Array.from({ length: (new Date().getFullYear() + 1) - 2000 + 1 }).map((_, i) => {
                                        const year = 2000 + i;
                                        const yearLabel = `${year}-${year + 1}`;
                                        return <option key={yearLabel} value={yearLabel}>{yearLabel}</option>;
                                    }).reverse()}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>start date</label>
                                    <input type="date" onChange={e => set("startDate", e.target.value || undefined)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>end date</label>
                                    <input type="date" onChange={e => set("endDate", e.target.value || undefined)} className={inputCls} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-1">
                                <input type="checkbox" id="isActive" defaultChecked onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-slate-200 text-[#1a7ea5] focus:ring-[#1a7ea5]/20" />
                                <label htmlFor="isActive" className="text-xs font-bold text-slate-600 cursor-pointer">set as active year</label>
                            </div>
                        </>
                    )}

                    {/* ── CLASSES ── */}
                    {type === "classes" && (
                        <>
                            <div>
                                <label className={labelCls}>class name</label>
                                <input type="text" placeholder="e.g. grade 10a" onChange={e => set("name", e.target.value)} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>level</label>
                                    <input type="text" placeholder="e.g. level 4" onChange={e => set("level", e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>stream</label>
                                    <input type="text" placeholder="e.g. science" onChange={e => set("stream", e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>academic year</label>
                                <select onChange={e => set("academicYearId", e.target.value)} className={inputCls}>
                                    <option value="">select year</option>
                                    {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.year}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* ── SUBJECTS ── */}
                    {type === "subjects" && (
                        <>
                            <div>
                                <label className={labelCls}>subject name</label>
                                <input type="text" placeholder="e.g. mathematics" onChange={e => set("name", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>subject code</label>
                                <input type="text" placeholder="e.g. math101" onChange={e => set("code", e.target.value)} className={inputCls} />
                            </div>
                        </>
                    )}

                    {/* ── STUDENTS ── */}
                    {type === "students" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>first name</label>
                                    <input type="text" placeholder="e.g. john" onChange={e => set("firstName", e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>last name</label>
                                    <input type="text" placeholder="e.g. doe" onChange={e => set("lastName", e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>student id</label>
                                <input type="text" placeholder="optional" onChange={e => set("studentId", e.target.value || undefined)} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>email</label>
                                    <input type="email" placeholder="optional" onChange={e => set("email", e.target.value || undefined)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>phone</label>
                                    <input type="tel" placeholder="optional" onChange={e => set("phoneNumber", e.target.value || undefined)} className={inputCls} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>gender</label>
                                    <select onChange={e => set("gender", e.target.value || undefined)} className={inputCls}>
                                        <option value="">select</option>
                                        <option value="MALE">male</option>
                                        <option value="FEMALE">female</option>
                                        <option value="OTHER">other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>date of birth</label>
                                    <input type="date" onChange={e => set("dateOfBirth", e.target.value || undefined)} className={inputCls} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>class</label>
                                    <select onChange={e => set("classId", e.target.value || undefined)} className={inputCls}>
                                        <option value="">assign later</option>
                                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>academic year</label>
                                    <select onChange={e => set("academicYearId", e.target.value || undefined)} className={inputCls}>
                                        <option value="">assign later</option>
                                        {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.year}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40 mt-2"
                    >
                        {isSubmitting ? "processing..." : "create now"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Bulk Import Modal ────────────────────────────────────────────────────────
const BulkImportModal = ({ schoolId, onClose, onSuccess, classes, academicYears }: any) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<any>(null);

    const downloadTemplate = () => {
        const data = [
            ["firstName", "lastName", "studentId", "email", "phoneNumber", "gender", "className", "academicYearName"],
            ["john", "doe", "STU001", "john@example.com", "123456789", "MALE", "Grade 1", "2023-2024"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students Template");
        XLSX.writeFile(wb, "students_template.xlsx");
    };

    const handleUpload = async () => {
        if (!file) return setError("please select a file first");
        setIsUploading(true);
        setError("");

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const bstr = e.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (!Array.isArray(data) || data.length === 0) {
                    setError("no data found in file");
                    setIsUploading(false);
                    return;
                }

                // Map className to classId and academicYearName to academicYearId
                const mappedData = data.map((row: any) => {
                    const cls = classes.find((c: any) => c.name.toLowerCase() === String(row.className || "").toLowerCase());
                    const year = academicYears.find((y: any) => y.year.toLowerCase() === String(row.academicYearName || "").toLowerCase());
                    return {
                        ...row,
                        classId: cls?.id,
                        academicYearId: year?.id
                    };
                });

                const response = await api.post(`/academic/schools/${schoolId}/students/bulk`, { students: mappedData });
                setStats(response.data.data);
                if (response.data.data.errors?.length === 0) {
                    onSuccess();
                }
            };
            reader.readAsBinaryString(file);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">bulk import</h3>
                <p className="text-slate-400 text-sm mb-8">upload an excel file to add multiple students.</p>

                {stats ? (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                            <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={32} />
                            <p className="text-2xl font-black text-emerald-600">{stats.created?.length || 0}</p>
                            <p className="text-sm font-bold text-emerald-500 uppercase">students imported</p>
                        </div>
                        {stats.errors?.length > 0 && (
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                <p className="text-xs font-black text-rose-500 uppercase tracking-widest pl-1">failed rows ({stats.errors.length})</p>
                                {stats.errors.map((err: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-600 font-medium">
                                        <span className="font-bold">{err.firstName}:</span> {err.error}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">done</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Loading Overlay */}
                        {isUploading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4"
                            >
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-4 border-[#1a7ea5]/10 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-transparent border-t-[#1a7ea5] rounded-full animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">importing students</p>
                                    <p className="text-xs text-slate-400 mt-1">please wait, this may take a moment...</p>
                                </div>
                            </motion.div>
                        )}

                        <button
                            onClick={downloadTemplate}
                            disabled={isUploading}
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[#1a7ea5] font-bold text-sm hover:border-[#1a7ea5] hover:bg-slate-50 transition-all disabled:opacity-40"
                        >
                            <Download size={18} />
                            download template
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                disabled={isUploading}
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className={`p-10 border-2 border-dashed rounded-2xl text-center transition-all ${file ? 'border-[#1a7ea5] bg-[#1a7ea5]/5' : 'border-slate-100 bg-slate-50'}`}>
                                <FileSpreadsheet className={`mx-auto mb-3 ${file ? 'text-[#1a7ea5]' : 'text-slate-300'}`} size={40} />
                                <p className="text-sm font-bold text-slate-600">{file ? file.name : "select excel file"}</p>
                                <p className="text-xs text-slate-400 mt-1">drag & drop or click to browse</p>
                            </div>
                        </div>

                        {error && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl text-center">{error}</div>}

                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="w-full py-4 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    importing...
                                </>
                            ) : (
                                <>
                                    <Upload size={14} />
                                    start import
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ─── Assign Class Modal ───────────────────────────────────────────────────────
const AssignClassModal = ({ schoolId, student, onClose, onSuccess, classes, academicYears }: any) => {
    const [formData, setFormData] = useState({
        classId: student.class?.id || "",
        academicYearId: student.academicYear?.id || ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!formData.classId || !formData.academicYearId) {
            setError("both class and academic year are required.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await api.post(`/academic/schools/${schoolId}/students/${student.id}/enroll`, formData);
            onSuccess();
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "failed to assign class.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 focus:border-[#1a7ea5]/20 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-1";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">assign class</h3>
                <p className="text-slate-400 text-sm mb-8">re-assign <span className="text-slate-900 font-bold">{student.firstName} {student.lastName}</span> to a class.</p>

                {error && <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

                <div className="space-y-5">
                    <div>
                        <label className={labelCls}>academic year</label>
                        <select value={formData.academicYearId} onChange={e => setFormData(p => ({ ...p, academicYearId: e.target.value }))} className={inputCls}>
                            <option value="">select year</option>
                            {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.year}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>class</label>
                        <select value={formData.classId} onChange={e => setFormData(p => ({ ...p, classId: e.target.value }))} className={inputCls}>
                            <option value="">select class</option>
                            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40 mt-2">
                        {isSubmitting ? "assigning..." : "update assignment"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


