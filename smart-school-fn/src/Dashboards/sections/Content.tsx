import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, BookOpen, FileText, Video, ListChecks, Edit, Inbox } from 'lucide-react';
import { LessonContentModal } from '../Modals/LessonContentModal';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useParams } from 'react-router-dom';
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
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Lesson | null>(null);
  const toast = useRef<Toast>(null);

  const dispatch = useAppDispatch();

  const {
    items: lessonContents,
    loading: lessonsLoading,
    error: lessonsError,
    success: createSuccess,
  } = useAppSelector((state) => state.lessonContent);


  const loading = lessonsLoading;
  const error = lessonsError;

  // Fetch data
  useEffect(() => {
    if (lessonId) dispatch(fetchLessonContent(lessonId));
    return () => {
      dispatch(clearLessonContent());
    };
  }, [lessonId, dispatch]);

  // Close modal after success
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

  // Save or update content
  const handleSaveContent = async (contentData: any) => {
    try {
      if (editingContent && editingContent.id) {
        // Update content
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
          summary: "Lesson Updated",
          detail: "Lesson updated successfully!",
          life: 3000,
        });
      } else if (lessonId) {
        // Create new content
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
          summary: "Lesson Created",
          detail: "Lesson created successfully!",
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.message || "Something went wrong while saving content",
        life: 4000,
      });
    }
  };

  // Delete content
  const handleDeleteContent = (lessonIdToDelete: string) => {
    confirmDialog({
      message: "Are you sure you want to delete this lesson content?",
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await dispatch(deleteLessonContent(lessonIdToDelete)).unwrap();
          toast.current?.show({
            severity: "success",
            summary: "Deleted",
            detail: "Lesson deleted successfully",
            life: 3000,
          });
        } catch (error: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error?.message || "Failed to delete lesson",
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-blue-600" />;
      case 'document': return <FileText className="h-5 w-5 text-green-600" />;
      case 'quiz':
      case 'test': return <ListChecks className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading lessons: {error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm font-medium text-red-700 hover:text-red-600">
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lesson Content</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" placeholder="Search content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <button onClick={() => handleOpenContentModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Lesson content
          </button>
        </div>

        {loading ? renderSkeleton() : (
          <ul className="divide-y divide-gray-200">
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <li key={item.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-4">
                      {getItemIcon(item.title)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenContentModal(item as unknown as Lesson)} className="p-1.5 text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 bg-indigo-500 text-white rounded" title="Edit">
                      <Edit className="h-4 w-4" />Edit
                    </button>
                    <button onClick={() => handleDeleteContent(item.id)} className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer bg-red-500 text-white rounded flex items-center gap-1" title="Delete" >
                      <Trash2 className="h-4 w-4" />Delete
                    </button>
                  </div>
                </div>
              </li>
            )) : (<div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold">No content found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adding some content to see it here.
              </p>
            </div>)}
          </ul>
        )}
      </div>

      <Toast ref={toast} position="top-right" />

      <LessonContentModal
        isOpen={isContentModalOpen}
        onClose={handleCloseContentModal}
        onSave={handleSaveContent}
        initialData={editingContent}
        isLoading={lessonsLoading}
      />
    </div>
  );
};
