import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, FileText, Video, ListChecks } from 'lucide-react';
import { LessonContentModal } from '../Modals/LessonContentModal';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useParams } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  fetchLessonContent, 
  clearLessonContent, 
  setCurrentContent 
} from '../../redux/features/lessons/lessonContentSlice';
import { fetchTestsByCourseId } from '../../redux/features/test/testSlice';

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


type ViewMode = 'lessons' | 'tests';

export const LessonContent = () => {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const { courseId } = useParams<{ courseId?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('lessons');
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const {
    items: lessonContents,
    loading: lessonsLoading,
    error: lessonsError,
  } = useAppSelector((state) => state.lessonContent);

  const {
    tests,
    loading: testsLoading,
    error: testsError,
  } = useAppSelector((state) => state.test);

  // Fetch data based on view mode
  useEffect(() => {
    if (viewMode === 'lessons') {
      if (lessonId) {
        dispatch(fetchLessonContent(lessonId));
      }
    } else {
      if (courseId) {
        dispatch(fetchTestsByCourseId(courseId));
      }
    } 

    return () => {
      if (viewMode === 'lessons') {
        dispatch(clearLessonContent());
      } 
    };
  }, [viewMode, lessonId, courseId, dispatch]);

  const loading = viewMode === 'lessons' ? lessonsLoading : testsLoading;
  const error = viewMode === 'lessons' ? lessonsError : testsError;


  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-blue-600" />;
      case 'document': return <FileText className="h-5 w-5 text-green-600" />;
      case 'quiz':
      case 'test': 
        return <ListChecks className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get the items to display based on view mode and apply search filter
  const itemsToDisplay = viewMode === 'lessons' ? lessonContents : tests;
  
  // Skeleton loading component
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-md mr-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading {viewMode}: {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Lesson | null>(null);

  const handleOpenContentModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingContent(lesson);
    } else {
      setEditingContent(null);
    }
    setIsContentModalOpen(true);
  };

  const handleCloseContentModal = () => {
    setIsContentModalOpen(false);
    setEditingContent(null);
  };

  const handleSaveContent = (contentData: any) => {
    if (editingContent) {
      // Update existing lesson
      dispatch(setCurrentContent({ ...editingContent, ...contentData }));
    } else {
      // Create new lesson
      const newLesson: Lesson = {
        id: Math.random().toString(36).substr(2, 9),
        title: contentData.title,
        course: contentData.course || { id: '1', title: 'Default Course' },
        type: contentData.type as 'video' || 'document',
        duration: contentData.duration || '00:00',
        order: contentData.order || 1,
        isPublished: contentData.isPublished || false,
        createdAt: new Date().toISOString(),
        description: contentData.textBody
      };
      dispatch(setCurrentContent(newLesson));
    }
    setIsContentModalOpen(false);
  };
  const filteredItems = itemsToDisplay.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('lessons')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'lessons' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setViewMode('tests')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'tests' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Tests
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => handleOpenContentModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {viewMode === 'lessons' ? 'Lesson' : 'Test'}
          </button>
        </div>

        {loading ? (
          renderSkeleton()
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredItems.map((item: any) => (
              <li key={item.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-4">
                      {getItemIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center mt-1">
                     
                        {item.type === 'test' && item.passingScore !== undefined && (
                          <>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {item.passingScore}% passing
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenContentModal(item as unknown as Lesson)}
                      className="p-1.5 text-gray-400 hover:text-gray-500"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-1.5 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LessonContentModal
        isOpen={isContentModalOpen}
        onClose={handleCloseContentModal}
        onSave={handleSaveContent}
        initialData={editingContent}
      />
    </div>
  );
};
