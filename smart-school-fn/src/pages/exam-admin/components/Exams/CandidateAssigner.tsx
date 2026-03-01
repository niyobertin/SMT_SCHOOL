import { useState } from 'react';
import { Search, CheckSquare, Square, Users, Loader2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';

interface CandidateAssignerProps {
    isOpen: boolean;
    onClose: () => void;
    exam: any;
    candidates: any[];
    onAssign: (candidateIds: string[]) => Promise<void>;
    loading?: boolean;
    search: string;
    onSearchChange: (val: string) => void;
}

export const CandidateAssigner = ({
    isOpen,
    onClose,
    exam,
    candidates,
    onAssign,
    loading,
    search,
    onSearchChange
}: CandidateAssignerProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const assignedIds = exam?.candidates?.map((c: any) => c.id) || [];

    const toggleCandidate = (id: string) => {
        if (assignedIds.includes(id)) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (selectedIds.length === 0) return;
        await onAssign(selectedIds);
        setSelectedIds([]);
        onClose();
    };

    const footer = (
        <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedIds.length} candidate(s) selected
            </span>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAssign}
                    disabled={loading || selectedIds.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Assign Now
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Candidates"
            description={`Manage participants for: ${exam.title}`}
            footer={footer}
            size="md"
        >
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 w-full rounded-2xl border-slate-100 bg-slate-50/50 border py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    {candidates.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No candidates found.</p>
                        </div>
                    ) : (
                        candidates.map(candidate => {
                            const isAssigned = assignedIds.includes(candidate.id);
                            const isSelected = selectedIds.includes(candidate.id);

                            return (
                                <div
                                    key={candidate.id}
                                    onClick={() => toggleCandidate(candidate.id)}
                                    className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${isAssigned ? 'bg-slate-50 border-slate-100 opacity-60' :
                                            isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex-shrink-0">
                                        {isAssigned ? <CheckSquare className="w-5 h-5 text-green-500" /> :
                                            isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                                <Square className="w-5 h-5 text-slate-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">{candidate.firstName} {candidate.lastName}</p>
                                        <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">{candidate.email} • {candidate.candidateId}</p>
                                    </div>
                                    {isAssigned && <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 italic">Assigned</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};
