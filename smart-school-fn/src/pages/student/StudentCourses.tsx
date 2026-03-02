import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

interface CourseEnrollment {
    id: string;
    courseId: string;
    course: {
        id: string;
        title: string;
        description?: string;
        thumbnail?: string;
        progress?: number;
    };
    enrollmentDate: string;
    isCompleted: boolean;
}

export const StudentCourses = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
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
                `${import.meta.env.VITE_API_URL}/api/student-auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEnrollments(data.data.enrollments || []);
        } catch (err: any) {
            console.error("Failed to load courses", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = enrollments.filter(enrollment =>
        enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {filteredCourses.map((enrollment, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={enrollment.id}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => navigate(`/courses/${enrollment.courseId}/lessons`)}
                        >
                            <div className="relative h-40 overflow-hidden">
                                {enrollment.course.thumbnail ? (
                                    <img
                                        src={enrollment.course.thumbnail}
                                        alt={enrollment.course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center capitalize">
                                        <BookOpen className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {enrollment.isCompleted ? (
                                        <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="bg-[#1a7ea5]/90 text-white p-1.5 rounded-full shadow-lg backdrop-blur-sm">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${enrollment.isCompleted ? "bg-green-50 text-green-600" : "bg-[#1a7ea5]/5 text-[#1a7ea5]"
                                        }`}>
                                        {enrollment.isCompleted ? "Completed" : "In Progress"}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#1a7ea5] transition-colors">
                                    {enrollment.course.title}
                                </h3>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        Enrolled {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-1 text-[#1a7ea5] font-semibold text-xs">
                                        Continue <ChevronRight className="w-3 h-3" />
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
