import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Save, CheckCircle2, XCircle, Clock, AlertCircle, Users as UsersIcon } from "lucide-react";
import type { AppDispatch, RootState } from "../../../redux/stores";
import { Toast } from 'primereact/toast';
import { fetchClasses, fetchClassStudents, bulkRecordAttendance } from "../../../redux/features/academic/academicSlice";

export const AttendanceSection = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const { classes, classStudents, loading, selectedYearId } = useSelector((state: RootState) => state.academic);
    const { user } = useSelector((state: RootState) => state.auth);
    const schoolId = user?.schoolStaff?.[0]?.schoolId || user?.userOrganizations?.[0]?.organizationId;

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchClasses({ schoolId, academicYearId: selectedYearId || undefined }));
        }
    }, [dispatch, schoolId, selectedYearId]);

    useEffect(() => {
        if (selectedClass && schoolId) {
            dispatch(fetchClassStudents({ schoolId, classId: selectedClass }));
        }
    }, [dispatch, selectedClass, schoolId]);

    // Initialize attendance records when students are fetched
    useEffect(() => {
        if (classStudents.length > 0) {
            const initialRecords = classStudents.map(student => ({
                studentId: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                status: "PRESENT",
                remarks: ""
            }));
            setAttendanceRecords(initialRecords);
        } else {
            setAttendanceRecords([]);
        }
    }, [classStudents]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceRecords(prev => prev.map(record =>
            record.studentId === studentId ? { ...record, status } : record
        ));
    };

    const handleRemarkChange = (studentId: string, remark: string) => {
        setAttendanceRecords(prev => prev.map(record =>
            record.studentId === studentId ? { ...record, remarks: remark } : record
        ));
    };

    const handleSaveAttendance = async () => {
        if (!selectedClass || !schoolId) return;

        setIsSaving(true);
        try {
            await dispatch(bulkRecordAttendance({
                schoolId,
                data: {
                    classId: selectedClass,
                    date: new Date(selectedDate),
                    records: attendanceRecords.map(r => ({
                        studentId: r.studentId,
                        status: r.status,
                        remarks: r.remarks
                    }))
                }
            })).unwrap();

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Attendance recorded successfully',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save attendance',
                life: 3000
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">attendance management</h1>
                    <p className="text-slate-500 font-medium mt-1">record and track daily student attendance.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">select class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                    >
                        <option value="">choose a class...</option>
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] mb-2 block ml-2">date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleSaveAttendance}
                        disabled={!selectedClass || attendanceRecords.length === 0 || isSaving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a7ea5] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-[#1a7ea5]/20"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {isSaving ? "saving..." : "save attendance"}
                    </button>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {!selectedClass ? (
                    <div className="py-24 text-center">
                        <UsersIcon size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">no class selected</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">please select a class from the options above to start recording attendance.</p>
                    </div>
                ) : loading ? (
                    <div className="py-24 text-center">
                        <div className="w-8 h-8 border-4 border-[#1a7ea5]/20 border-t-[#1a7ea5] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading students...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">student name</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {attendanceRecords.map((record) => (
                                    <tr key={record.studentId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">
                                            {record.firstName} {record.lastName}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {[
                                                    { id: "PRESENT", icon: CheckCircle2, color: "emerald", label: "P" },
                                                    { id: "ABSENT", icon: XCircle, color: "rose", label: "A" },
                                                    { id: "LATE", icon: Clock, color: "amber", label: "L" },
                                                    { id: "EXCUSED", icon: AlertCircle, color: "blue", label: "E" }
                                                ].map((status) => (
                                                    <button
                                                        key={status.id}
                                                        onClick={() => handleStatusChange(record.studentId, status.id)}
                                                        title={status.id}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${record.status === status.id
                                                            ? `bg-${status.color}-50 text-${status.color}-600 ring-2 ring-${status.color}-500/20 shadow-sm`
                                                            : "bg-slate-50 text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                                                            }`}
                                                    >
                                                        <status.icon size={18} />
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <input
                                                type="text"
                                                value={record.remarks}
                                                onChange={(e) => handleRemarkChange(record.studentId, e.target.value)}
                                                placeholder="add a remark..."
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
