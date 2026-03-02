import { Plus, Edit, Calendar, Users, BookOpen, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import type { AppDispatch, RootState } from "../../../redux/stores";
import { Toast } from 'primereact/toast';
import {
    fetchAcademicYears, createAcademicYear,
    fetchClasses, createClass,
    fetchSubjects, createSubject
} from "../../../redux/features/academic/academicSlice";

type Tab = "years" | "classes" | "subjects";

export const AcademicSection = () => {
    const [activeTab, setActiveTab] = useState<Tab>("years");
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);

    const { years, classes, subjects, loading } = useSelector((state: RootState) => state.academic);
    const { user } = useSelector((state: RootState) => state.auth);
    const schoolId = user?.schoolStaff?.[0]?.schoolId || user?.userOrganizations?.[0]?.organizationId;

    useEffect(() => {
        if (schoolId) {
            if (activeTab === "years") dispatch(fetchAcademicYears(schoolId));
            if (activeTab === "classes") dispatch(fetchClasses({ schoolId }));
            if (activeTab === "subjects") dispatch(fetchSubjects(schoolId));
        }
    }, [dispatch, schoolId, activeTab]);

    const handleCreateSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
        setShowModal(false);
    };

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
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Academic Setup</h1>
                    <p className="text-slate-500 font-medium mt-3">Manage years, classes, and subjects for your school.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20"
                >
                    <Plus size={16} />
                    {activeTab === "years" ? "New Year" : activeTab === "classes" ? "New Class" : "New Subject"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit border border-slate-100">
                {[
                    { id: "years", label: "Years", icon: Calendar },
                    { id: "classes", label: "Classes", icon: Users },
                    { id: "subjects", label: "Subjects", icon: BookOpen }
                ].map((tab) => (
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

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    {activeTab === "years" ? "Academic Year" : activeTab === "classes" ? "Class Name" : "Subject Name"}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    {activeTab === "years" ? "Duration" : activeTab === "classes" ? "Level / Stream" : "Code"}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
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
                                            {year.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === "classes" && classes.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-900">{c.name}</td>
                                    <td className="px-6 py-5 text-sm text-slate-500">
                                        {c.level || 'N/A'} {c.stream ? `/ ${c.stream}` : ''}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-xs font-bold text-slate-400">
                                            {c._count?.students || 0} Students
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === "subjects" && subjects.map((s: any) => (
                                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-900">{s.name}</td>
                                    <td className="px-6 py-5 text-sm font-black text-[#1a7ea5] uppercase">{s.code || '---'}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Link</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-[#1a7ea5] transition-all"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(loading || (activeTab === 'years' && years.length === 0) || (activeTab === 'classes' && classes.length === 0) || (activeTab === 'subjects' && subjects.length === 0)) && !loading && (
                        <div className="py-20 text-center text-slate-400 font-medium">No results found for this category.</div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <CreateAcademicModal
                    type={activeTab}
                    schoolId={schoolId}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleCreateSuccess}
                    academicYears={years}
                />
            )}
        </motion.div>
    );
};

const CreateAcademicModal = ({ type, schoolId, onClose, onSuccess, academicYears }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (type === "years") {
                await dispatch(createAcademicYear({ schoolId, data: formData })).unwrap();
                onSuccess("Academic year created!");
                dispatch(fetchAcademicYears(schoolId));
            } else if (type === "classes") {
                await dispatch(createClass({ schoolId, data: formData })).unwrap();
                onSuccess("Class created!");
                dispatch(fetchClasses({ schoolId }));
            } else if (type === "subjects") {
                await dispatch(createSubject({ schoolId, data: formData })).unwrap();
                onSuccess("Subject created!");
                dispatch(fetchSubjects(schoolId));
            }
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
                <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Create {type === "years" ? "Year" : type === "classes" ? "Class" : "Subject"}</h3>

                <div className="space-y-6">
                    {type === "years" && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Year Name</label>
                                <select
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                                >
                                    <option value="">Select Academic Year</option>
                                    {Array.from({ length: (new Date().getFullYear() + 1) - 2000 + 1 }).map((_, i) => {
                                        const year = 2000 + i;
                                        const yearLabel = `${year}-${year + 1}`;
                                        return <option key={yearLabel} value={yearLabel}>{yearLabel}</option>;
                                    }).reverse()}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Start Date (Optional)</label>
                                    <input type="date" onChange={e => setFormData({ ...formData, startDate: e.target.value || undefined })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">End Date (Optional)</label>
                                    <input type="date" onChange={e => setFormData({ ...formData, endDate: e.target.value || undefined })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    defaultChecked={true}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-200 text-[#1a7ea5] focus:ring-[#1a7ea5]/20"
                                />
                                <label htmlFor="isActive" className="text-xs font-bold text-slate-600 cursor-pointer">Set as Active Year</label>
                            </div>
                        </>
                    )}

                    {type === "classes" && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Class Name</label>
                                <input type="text" placeholder="e.g. Grade 10A" onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Level</label>
                                    <input type="text" placeholder="e.g. Level 4" onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Stream</label>
                                    <input type="text" placeholder="e.g. Science" onChange={e => setFormData({ ...formData, stream: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Academic Year</label>
                                <select onChange={e => setFormData({ ...formData, academicYearId: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all">
                                    <option value="">Select Year</option>
                                    {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.year}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {type === "subjects" && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Subject Name</label>
                                <input type="text" placeholder="e.g. Mathematics" onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">Subject Code</label>
                                <input type="text" placeholder="e.g. MATH101" onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#1a7ea5] text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-[#1a7ea5]/20 disabled:opacity-40"
                    >
                        {isSubmitting ? "Processing..." : "Create Now"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
