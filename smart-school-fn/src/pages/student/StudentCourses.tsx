import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, User } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    progress?: number;
    category?: { name: string };
    instructor?: { firstName: string, lastName: string };
}

export const StudentCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem("accessToken_student");
            if (!token) {
                navigate("/login");
                return;
            }

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/student-auth/courses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCourses(data.data || []);
        } catch (err: any) {
            console.error("Failed to load courses", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a7ea5]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
                    <p className="text-gray-500 text-sm">
                        View and manage all your assigned learning paths.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7ea5]/20 focus:border-[#1a7ea5] transition-all w-full md:w-64 shadow-sm"
                    />
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-gray-300 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No courses found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? "Try a different search term." : "You haven't been assigned any courses yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={course.id}
                            className="group bg-white rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/courses/${course.id}/lessons`)}
                        >
                            <div className="relative h-44 bg-slate-100 rounded-xl overflow-hidden">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#1a7ea5]/10 to-transparent flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-[#1a7ea5]/20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                        Assigned
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#1a7ea5]/5 text-[#1a7ea5] rounded-xl">
                                        {course.category?.name || "Curriculum"}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1a7ea5] transition-colors line-clamp-2">
                                    {course.title}
                                </h3>

                                <p className="text-sm text-slate-500 font-medium mt-3 line-clamp-2 leading-relaxed">
                                    {course.description || "Start your learning journey with this course."}
                                </p>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : "Instructor"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#1a7ea5] font-black text-[10px] uppercase tracking-widest">
                                        Proceed <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ChevronRight = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);
