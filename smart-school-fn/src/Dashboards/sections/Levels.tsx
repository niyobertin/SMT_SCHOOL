import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Award, Lock, ChevronLeft, ChevronUp, ChevronDown, Unlock } from "lucide-react";
import { LevelModal } from "../Modals/LevelModal";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchLevelsByCourse,
  createLevel,
  updateLevel,
  deleteLevel,
  reorderLevels,
  unlockLevelForUser,
  clearLevels,
} from "../../redux/features/levels/levelSlice";
import type { AppDispatch, RootState } from "../../redux/stores";
import { Toast } from "primereact/toast";

export const Levels = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: levels, loading } = useSelector((state: RootState) => state.levels);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlockLevelId, setUnlockLevelId] = useState<string | null>(null);
  const [unlockUserId, setUnlockUserId] = useState("");
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchLevelsByCourse(courseId));
    }
    return () => {
      dispatch(clearLevels());
    };
  }, [courseId, dispatch]);

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      if (editingLevel) {
        await dispatch(updateLevel({ levelId: editingLevel.id, data: formData })).unwrap();
      } else {
        await dispatch(createLevel({ courseId: courseId!, data: formData })).unwrap();
      }
      toast.current?.show({
        severity: "success",
        summary: editingLevel ? "Level Updated" : "Level Created",
        detail: editingLevel ? "Level updated successfully!" : "Level created successfully!",
        life: 3000,
      });
      setIsModalOpen(false);
      setEditingLevel(null);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: typeof error === "string" ? error : "Failed to save level.",
        life: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteLevel(deleteId)).unwrap();
      toast.current?.show({ severity: "success", summary: "Level Deleted", life: 3000 });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: typeof error === "string" ? error : "This level may already have enrollments or payments.",
        life: 4000,
      });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const moveLevel = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= levels.length) return;
    const reordered = [...levels];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const order = reordered.map((l, i) => ({ levelId: l.id, order: i + 1 }));
    await dispatch(reorderLevels({ courseId: courseId!, order })).unwrap();
  };

  const handleUnlock = async () => {
    if (!unlockLevelId || !unlockUserId) return;
    try {
      await dispatch(unlockLevelForUser({ levelId: unlockLevelId, userId: unlockUserId })).unwrap();
      toast.current?.show({ severity: "success", summary: "Level unlocked for user", life: 3000 });
      setUnlockLevelId(null);
      setUnlockUserId("");
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Unlock Failed",
        detail: typeof error === "string" ? error : "Could not unlock level.",
        life: 4000,
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <Toast ref={toast} position="top-right" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#1a7ea5] mb-2">
            <button
              onClick={() => navigate(`/dashboard/courses/${courseId}`)}
              className="p-2 hover:bg-[#1a7ea5]/10 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Lessons</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Course Levels</h1>
          <p className="text-slate-500 font-medium mt-3">
            Configure paid, sequential levels with their own exam and certificate.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLevel(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 shrink-0"
        >
          <Plus size={16} />
          Add Level
        </button>
      </div>

      {loading && levels.length === 0 ? (
        <div className="h-64 bg-slate-50 animate-pulse rounded-2xl" />
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {levels.map((level, idx) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveLevel(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-slate-300 hover:text-[#1a7ea5] disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveLevel(idx, 1)}
                      disabled={idx === levels.length - 1}
                      className="p-1 text-slate-300 hover:text-[#1a7ea5] disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-[#1a7ea5]/10 rounded-xl flex items-center justify-center text-[#1a7ea5] font-bold">
                    {level.order}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{level.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                      <span>
                        {level.price} {level.currency}
                      </span>
                      {level.certificateEnabled && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Award size={12} /> Certificate
                        </span>
                      )}
                      {!level.isPublished && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Lock size={12} /> Unpublished
                        </span>
                      )}
                      {level.test && <span>Exam: {level.test.title}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUnlockLevelId(level.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                    title="Grant a specific user access without payment"
                  >
                    <Unlock size={14} /> Unlock For User
                  </button>
                  <button
                    onClick={() => {
                      setEditingLevel(level);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#1a7ea5] hover:border-[#1a7ea5]/20 rounded-xl transition-all shadow-sm"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(level.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {levels.length === 0 && (
            <div className="px-8 py-24 text-center">
              <h3 className="text-xl font-bold text-slate-900">No levels yet</h3>
              <p className="text-slate-400 font-medium mt-2">
                Add a level to turn this course into a paid, level-by-level program.
              </p>
            </div>
          )}
        </div>
      )}

      <LevelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLevel(null);
        }}
        initialData={editingLevel}
        onSave={handleSave}
        loading={saving}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Level"
        message="This will permanently delete the level. Levels with existing enrollments or payments cannot be deleted."
      />

      {unlockLevelId && (
        <div className="fixed inset-0 flex items-center bg-gray-700/70 backdrop-blur-sm justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Unlock Level For User</h2>
            <p className="text-sm text-gray-600 mb-4">
              Grants this user access to the level without payment and bypasses the sequential-order check.
            </p>
            <input
              type="text"
              placeholder="User ID"
              value={unlockUserId}
              onChange={(e) => setUnlockUserId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setUnlockLevelId(null);
                  setUnlockUserId("");
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Levels;
