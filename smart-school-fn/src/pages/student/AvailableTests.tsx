import { useState, useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import api from "../../redux/api/api";
import {
    FileQuestion,
    Clock,
    ChevronRight,
    AlertCircle,
    Search,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Test {
    id: string;
    title: string;
    description: string;
    duration: number;
    totalQuestions: number;
    course: {
        id: string;
        name: string;
    };
    academicYear: {
        id: string;
        year: string;
    };
}

export const AvailableTests = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { student, selectedAcademicYear } = useAppSelector((state) => state.studentAuth);

    useEffect(() => {
        console.log("AvailableTests: student =", student, "year =", selectedAcademicYear);
        if (student && selectedAcademicYear) {
            console.log("AvailableTests: Triggering fetchAvailableTests");
            fetchAvailableTests();
        }
    }, [student, selectedAcademicYear]);

    const fetchAvailableTests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken_student");
            const { data } = await api.get(
                "/student-portal/available-tests",
                {
                    params: { academicYearId: selectedAcademicYear.id },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setTests(data.data || []);
        } catch (err: any) {
            console.error("AvailableTests: ERROR FETCHING TESTS", err);
            if (err.response) {
                console.error("AvailableTests: Response data:", err.response.data);
                console.error("AvailableTests: Response status:", err.response.status);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Available Tests</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Browse and take tests for your assigned courses in the {selectedAcademicYear?.year} academic year.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tests or courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {/* Test List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileQuestion className="text-slate-300 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Tests Found</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                        There are no available tests for your courses in this academic year at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map((test) => (
                        <motion.div
                            key={test.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 bg-[#1a7ea5]/10 rounded-xl group-hover:bg-[#1a7ea5] transition-colors">
                                        <FileQuestion className="text-[#1a7ea5] group-hover:text-white transition-colors" size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Available
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">
                                    {test.title}
                                </h3>
                                <p className="text-xs font-medium text-[#1a7ea5] mb-4 uppercase tracking-wider">
                                    {test.course.name}
                                </p>

                                <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>{test.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle size={14} />
                                        <span>{test.totalQuestions} Questions</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {test.academicYear.year}
                                </span>
                                <button
                                    className="flex items-center gap-1.5 text-[#1a7ea5] font-bold text-sm hover:gap-2 transition-all"
                                    onClick={() => navigate(`/student/take-test/${test.id}`)}
                                >
                                    Start Test
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
