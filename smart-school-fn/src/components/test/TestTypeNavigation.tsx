import { Award, FileQuestion, Users, GraduationCap } from "lucide-react";

interface TestTypeNavigationProps {
    activeType: "ALL" | "STANDARD" | "PSYCHOMETRIC" | "INTERVIEW" | "OPEN_ENDED";
    onTypeChange: (type: "ALL" | "STANDARD" | "PSYCHOMETRIC" | "INTERVIEW" | "OPEN_ENDED") => void;
    counts: {
        all: number;
        standard: number;
        psychometric: number;
        interview: number;
        openEnded: number;
    };
}

export function TestTypeNavigation({
    activeType,
    onTypeChange,
    counts,
}: TestTypeNavigationProps) {
    const types = [
        {
            key: "ALL" as const,
            label: "All Tests",
            icon: FileQuestion,
            color: "gray",
            count: counts.all,
        },
        {
            key: "STANDARD" as const,
            label: "Course Exams",
            icon: GraduationCap,
            color: "blue",
            count: counts.standard,
        },
        {
            key: "PSYCHOMETRIC" as const,
            label: "Psychometric",
            icon: Award,
            color: "purple",
            count: counts.psychometric,
        },
        {
            key: "INTERVIEW" as const,
            label: "Interview",
            icon: Users,
            color: "green",
            count: counts.interview,
        },
        {
            key: "OPEN_ENDED" as const,
            label: "Open-Ended",
            icon: FileQuestion,
            color: "orange",
            count: counts.openEnded,
        },
    ];

    const getColorClasses = (color: string, isActive: boolean) => {
        const colors = {
            gray: {
                active: "bg-gray-600 text-white border-gray-600",
                inactive: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
            },
            blue: {
                active: "bg-blue-600 text-white border-blue-600",
                inactive: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
            },
            purple: {
                active: "bg-purple-600 text-white border-purple-600",
                inactive: "bg-white text-purple-700 border-purple-300 hover:bg-purple-50",
            },
            green: {
                active: "bg-green-600 text-white border-green-600",
                inactive: "bg-white text-green-700 border-green-300 hover:bg-green-50",
            },
            orange: {
                active: "bg-orange-600 text-white border-orange-600",
                inactive: "bg-white text-orange-700 border-orange-300 hover:bg-orange-50",
            },
        };

        return isActive
            ? colors[color as keyof typeof colors].active
            : colors[color as keyof typeof colors].inactive;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Type</h3>
            <div className="flex flex-wrap gap-2">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isActive = activeType === type.key;

                    return (
                        <button
                            key={type.key}
                            onClick={() => onTypeChange(type.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all duration-200 ${getColorClasses(
                                type.color,
                                isActive
                            )} ${isActive ? "shadow-md" : ""}`}
                        >
                            <Icon size={16} />
                            <span>{type.label}</span>
                            <span
                                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                                        ? "bg-white/20 text-white"
                                        : `bg-${type.color}-100 text-${type.color}-700`
                                    }`}
                            >
                                {type.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
