import React from "react";
import { X, Calendar, Check } from "lucide-react";
import { motion } from "framer-motion";

interface AcademicYear {
    id: string;
    year: string;
    isActive: boolean;
}

interface YearSelectionModalProps {
    years: AcademicYear[];
    onSelect: (year: AcademicYear) => void;
    onClose: () => void;
    selectedYearId?: string;
}

export const YearSelectionModal: React.FC<YearSelectionModalProps> = ({
    years,
    onSelect,
    onClose,
    selectedYearId,
}) => {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
                {/* Header */}
                <div className="bg-[#1a7ea5] p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-bold">Change User Preferences</h3>
                    </div>
                </div>

                <div className="p-8">
                    <p className="text-slate-500 text-sm mb-6 font-medium">
                        Select the academic year you wish to access. This will determine the courses and data shown in your portal.
                    </p>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5] ml-1">
                            Academic Year: *
                        </label>
                        <div className="grid gap-2">
                            {years.map((year) => (
                                <button
                                    key={year.id}
                                    onClick={() => onSelect(year)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedYearId === year.id
                                        ? "border-[#1a7ea5] bg-[#1a7ea5]/5 text-[#1a7ea5]"
                                        : "border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{year.year}</span>
                                        {year.isActive && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    {selectedYearId === year.id && (
                                        <div className="p-1 bg-[#1a7ea5] text-white rounded-full">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
                        >
                            Cancel
                        </button>
                        {/* The Save button is implicit in the selection, but we can add a primary button if needed */}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
