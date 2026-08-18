import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, PlayCircle, Award, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { fetchCourseLevelProgress } from "../../redux/features/levels/levelSlice";
import type { AppDispatch, RootState } from "../../redux/stores";

interface LevelProgressionListProps {
  courseId: string;
  lessons: any[];
  onStartLesson: (lessonId: string) => void;
}

const reasonLabel: Record<string, string> = {
  not_paid: "Payment required",
  sequential_locked: "Complete the previous level first",
};

export const LevelProgressionList = ({ courseId, lessons, onStartLesson }: LevelProgressionListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { progress, progressLoading } = useSelector((state: RootState) => state.levels);
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseLevelProgress(courseId));
    }
  }, [courseId, dispatch]);

  if (progressLoading && !progress) {
    return <div className="text-center py-8 animate-pulse text-slate-400">Loading level progress...</div>;
  }

  if (!progress) return null;

  const handlePay = (levelId: string, price: number) => {
    navigate(`/payment-flow/${price}/30?mode=level&levelId=${levelId}`);
  };

  return (
    <div className="space-y-4">
      {progress.levels.map((level) => {
        const isExpanded = expandedLevelId === level.id;
        const levelLessons = lessons.filter((l) => l.levelId === level.id);
        const statusLabel = !level.access.canAccess
          ? reasonLabel[level.access.reason || "not_paid"]
          : level.certificate.issued
          ? "Certificate available"
          : level.exam?.isPassed
          ? "Exam passed"
          : level.content.contentComplete
          ? "Ready for exam"
          : "In progress";

        return (
          <div key={level.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedLevelId(isExpanded ? null : level.id)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                    level.access.canAccess ? "bg-[#1a7ea5]/10 text-[#1a7ea5]" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {level.access.canAccess ? level.order : <Lock size={16} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Level {level.order} — {level.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">{statusLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!level.access.canAccess ? (
                  level.access.reason === "not_paid" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePay(level.id, level.price);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1a7ea5] text-white rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                      <CreditCard size={14} />
                      Pay {level.price} {level.currency}
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Locked
                    </span>
                  )
                ) : level.certificate.issued ? (
                  <a
                    href={level.certificate.pdfUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest"
                  >
                    <Award size={14} /> Certificate
                  </a>
                ) : (
                  <CheckCircle2 size={20} className="text-[#1a7ea5]" />
                )}
                {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </div>
            </button>

            {isExpanded && level.access.canAccess && (
              <div className="border-t border-slate-50 p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Content Progress</span>
                    <span>{level.content.completedLessons}/{level.content.totalLessons} lessons ({level.content.percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a7ea5] rounded-full transition-all"
                      style={{ width: `${level.content.percent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {levelLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <span className="text-sm font-semibold text-slate-700">{lesson.title}</span>
                      <button
                        onClick={() => onStartLesson(lesson.id)}
                        className="flex items-center gap-1 text-xs font-bold text-[#1a7ea5] uppercase tracking-widest"
                      >
                        <PlayCircle size={14} /> Open
                      </button>
                    </div>
                  ))}
                  {levelLessons.length === 0 && (
                    <p className="text-xs text-slate-400">No lessons added to this level yet.</p>
                  )}
                </div>

                {level.exam && (
                  <div className="flex items-center justify-between p-4 bg-[#1a7ea5]/5 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Level Exam</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {level.exam.isPassed
                          ? `Passed (best score ${level.exam.bestScore}%)`
                          : level.content.contentComplete
                          ? "Ready to take"
                          : "Complete all lessons to unlock"}
                        {level.exam.maxAttempts ? ` · ${level.exam.attemptsUsed}/${level.exam.maxAttempts} attempts` : ""}
                      </p>
                    </div>
                    <button
                      disabled={!level.content.contentComplete}
                      onClick={() => navigate(`/test/${level.exam!.testId}`, { state: { fromCourse: true } })}
                      className="px-5 py-2.5 bg-[#1a7ea5] text-white rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                    >
                      {level.exam.isPassed ? "Retake" : "Take Exam"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LevelProgressionList;
