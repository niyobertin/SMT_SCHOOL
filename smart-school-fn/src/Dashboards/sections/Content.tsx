import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, BookOpen, FileText, Video, ListChecks, Edit, Inbox, ChevronLeft, MoreVertical } from 'lucide-react';
import { LessonContentModal } from '../Modals/LessonContentModal';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchLessonContent,
  clearLessonContent,
  createLessonContent,
  deleteLessonContent,
  updateLessonContent
} from '../../redux/features/lessons/lessonContentSlice';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface Lesson {
  id: string;
  title: string;
  course: {
    id: string;
    title: string;
  };
  type: 'video' | 'document' | 'quiz';
  duration: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  description?: string;
}

export const LessonContent = () => {
  const { lessonId, courseId } = useParams<{ lessonId?: string, courseId?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Lesson | null>(null);
  const toast = useRef<Toast>(null);

  const dispatch = useAppDispatch();

  const {
    items: lessonContents,
    loading: lessonsLoading,
    success: createSuccess,
  } = useAppSelector((state) => state.lessonContent);

  const loading = lessonsLoading;

  useEffect(() => {
    if (lessonId) dispatch(fetchLessonContent(lessonId));
    return () => {
      dispatch(clearLessonContent());
    };
  }, [lessonId, dispatch]);

  useEffect(() => {
    if (createSuccess && isContentModalOpen) {
      setIsContentModalOpen(false);
      setEditingContent(null);
    }
  }, [createSuccess, isContentModalOpen]);

  const handleOpenContentModal = (lesson?: Lesson) => {
    if (lesson) setEditingContent(lesson);
    else setEditingContent(null);
    setIsContentModalOpen(true);
  };

  const handleCloseContentModal = () => {
    setEditingContent(null);
    setIsContentModalOpen(false);
  };

  const handleSaveContent = async (contentData: any) => {
    try {
      if (editingContent && editingContent.id) {
        const formData = new FormData();
        formData.append("title", contentData.get("title") || "");
        formData.append("textBody", contentData.get("textBody") || "");
        formData.append("order", contentData.get("order")?.toString() || "1");

        ["fileVideo", "fileAudio", "filePDF", "fileImage"].forEach((key) => {
          const file = contentData.get(key);
          if (file) formData.append(key, file);
        });
        formData.append("id", editingContent.id);

        await dispatch(updateLessonContent(formData)).unwrap();

        toast.current?.show({
          severity: "success",
          summary: "Updated",
          detail: "Content synced successfully!",
          life: 3000,
        });
      } else if (lessonId) {
        const formData = new FormData();
        formData.append("title", contentData.get("title") || "");
        formData.append("textBody", contentData.get("textBody") || "");
        formData.append("order", contentData.get("order")?.toString() || "1");

        ["fileVideo", "fileAudio", "filePDF", "fileImage"].forEach((key) => {
          const file = contentData.get(key);
          if (file) formData.append(key, file);
        });

        formData.append("lessonId", lessonId);

        await dispatch(createLessonContent(formData)).unwrap();
        dispatch(fetchLessonContent(lessonId!));

        toast.current?.show({
          severity: "success",
          summary: "Created",
          detail: "New resource added!",
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Execution Failed",
        detail: error?.message || "Something went wrong while saving content",
        life: 4000,
      });
    }
  };

  const handleDeleteContent = (lessonIdToDelete: string) => {
    confirmDialog({
      message: "This will permanently remove this resource from the course pipeline. Continue?",
      header: "Confirm Destruction",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await dispatch(deleteLessonContent(lessonIdToDelete)).unwrap();
          toast.current?.show({
            severity: "success",
            summary: "Purged",
            detail: "Resource removed successfully",
            life: 3000,
          });
        } catch (error: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error?.message || "Failed to delete resource",
            life: 4000,
          });
        }
      },
      reject: () => { }
    });
  };

  const filteredItems = lessonContents.filter(item =>
    item?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('video')) return <Video size={18} />;
    if (t.includes('pdf') || t.includes('document')) return <FileText size={18} />;
    if (t.includes('quiz') || t.includes('test')) return <ListChecks size={18} />;
    return <BookOpen size={18} />;
  };

  if (loading && lessonContents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-50 animate-pulse rounded-[32px]" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <ConfirmDialog />
      <Toast ref={toast} position="top-right" />

      {/* Redesigned Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#1a7ea5] mb-2">
            <button
              onClick={() => navigate(`/dashboard/courses/${courseId}/lessons`)}
              className="p-2 hover:bg-[#1a7ea5]/10 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Lessons</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Resource Assets</h1>
          <p className="text-slate-500 font-medium mt-3">Manage the granular educational materials for this module.</p>
        </div>
        <button
          onClick={() => handleOpenContentModal()}
          className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1a7ea5]/20 shrink-0"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative group flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Find resources..."
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#1a7ea5]/10 focus:border-[#1a7ea5]/30 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[Video, FileText, ListChecks].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-slate-400">
                  <Icon size={12} />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Media Mix Available</span>
          </div>
        </div>

        <div className="p-6">
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative flex items-center justify-between p-5 bg-white rounded-xl border border-slate-50 hover:border-[#1a7ea5]/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a7ea5] group-hover:bg-[#1a7ea5] group-hover:text-white transition-all duration-300">
                      {getItemIcon(item.title)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5]/60">Resource #{idx + 1}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400">Synced to Cloud</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 transition-all">
                    <button
                      onClick={() => handleOpenContentModal(item as unknown as Lesson)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 border border-slate-50 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center text-slate-300">
                      <MoreVertical size={16} />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <div className="bg-slate-50 p-8 rounded-[40px] mb-8 text-slate-200">
                    <Inbox size={64} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Vault is empty</h3>
                  <p className="text-slate-400 font-medium mt-2 max-w-xs text-center">Inject some educational fire by adding your first resource content.</p>
                  <button
                    onClick={() => handleOpenContentModal()}
                    className="mt-8 px-6 py-3 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all"
                  >
                    Initialize First Asset
                  </button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <LessonContentModal
        isOpen={isContentModalOpen}
        onClose={handleCloseContentModal}
        onSave={handleSaveContent}
        initialData={editingContent}
        isLoading={lessonsLoading}
      />
    </motion.div>
  );
};

export default LessonContent;
