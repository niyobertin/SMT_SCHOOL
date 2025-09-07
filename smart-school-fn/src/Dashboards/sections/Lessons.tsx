import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, FileText, Video, File, ListChecks } from 'lucide-react';


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

interface Test {
  id: string;
  title: string;
  course: {
    id: string;
    title: string;
  };
  duration: string;
  passingScore: number;
  totalQuestions: number;
  isPublished: boolean;
  createdAt: string;
  description?: string;
}

type ViewMode = 'lessons' | 'tests';

export const Lessons = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLessons: Lesson[] = [
          {
            id: '1',
            title: 'Introduction to React',
            course: { id: '1', title: 'React Fundamentals' },
            type: 'video',
            duration: '15:30',
            order: 1,
            isPublished: true,
            createdAt: '2023-09-01T10:00:00Z'
          },
          {
            id: '2',
            title: 'React Components and Props',
            course: { id: '1', title: 'React Fundamentals' },
            type: 'document',
            duration: '20:15',
            order: 2,
            isPublished: true,
            createdAt: '2023-09-02T11:30:00Z'
          },
          {
            id: '3',
            title: 'State and Lifecycle',
            course: { id: '1', title: 'React Fundamentals' },
            type: 'video',
            duration: '25:45',
            order: 3,
            isPublished: false,
            createdAt: '2023-09-03T09:15:00Z'
          },
          {
            id: '4',
            title: 'JavaScript Basics',
            course: { id: '2', title: 'JavaScript for Beginners' },
            type: 'document',
            duration: '30:00',
            order: 1,
            isPublished: true,
            createdAt: '2023-08-15T08:00:00Z'
          },
          {
            id: '5',
            title: 'Functions and Scope',
            course: { id: '2', title: 'JavaScript for Beginners' },
            type: 'quiz',
            duration: '15:00',
            order: 2,
            isPublished: true,
            createdAt: '2023-08-16T10:30:00Z'
          },
          {
            id: '6',
            title: 'Arrays and Objects',
            course: { id: '2', title: 'JavaScript for Beginners' },
            type: 'video',
            duration: '22:30',
            order: 3,
            isPublished: true,
            createdAt: '2023-08-17T14:15:00Z'
          },
          {
            id: '7',
            title: 'Introduction to TypeScript',
            course: { id: '3', title: 'TypeScript Masterclass' },
            type: 'video',
            duration: '18:20',
            order: 1,
            isPublished: true,
            createdAt: '2023-09-10T13:00:00Z'
          },
          {
            id: '8',
            title: 'TypeScript Types',
            course: { id: '3', title: 'TypeScript Masterclass' },
            type: 'document',
            duration: '25:00',
            order: 2,
            isPublished: true,
            createdAt: '2023-09-11T15:30:00Z'
          },
          {
            id: '9',
            title: 'TypeScript with React',
            course: { id: '3', title: 'TypeScript Masterclass' },
            type: 'video',
            duration: '35:15',
            order: 3,
            isPublished: false,
            createdAt: '2023-09-12T11:45:00Z'
          },
          {
            id: '10',
            title: 'TypeScript Quiz',
            course: { id: '3', title: 'TypeScript Masterclass' },
            type: 'quiz',
            duration: '20:00',
            order: 4,
            isPublished: true,
            createdAt: '2023-09-13T16:20:00Z'
          }
        ];
        
        setLessons(mockLessons);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Mock data for tests
  useEffect(() => {
    const fetchTests = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockTests: Test[] = [
          {
            id: 't1',
            title: 'Midterm Exam',
            course: { id: 'c1', title: 'Mathematics' },
            duration: '60 min',
            passingScore: 70,
            totalQuestions: 20,
            isPublished: true,
            createdAt: '2023-10-15',
          },
          // Add more test data as needed
        ];
        setTests(mockTests);
      }, 500);
    };

    fetchTests();
  }, []);

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        // TODO: Replace with actual API call
        console.log('Deleting lesson:', lessonId);
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  // Get icon based on lesson type
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'quiz':
        return <File className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  // Function to get test icon
  const getTestIcon = () => (
    <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
      <ListChecks size={16} />
    </div>
  );

  // State for view/edit modal
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Lesson>>({});

  // Add test form state
  const [testFormData, setTestFormData] = useState<Partial<Test>>({});
  const [isTestEditMode, setIsTestEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // Handle view lesson
  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Handle edit lesson
  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setFormData({ ...lesson });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditMode && selectedLesson) {
        // Update existing lesson
        setLessons(lessons.map(lesson => 
          lesson.id === selectedLesson.id ? { ...lesson, ...formData } as Lesson : lesson
        ));
      } else {
        // Create new lesson
        const newLesson: Lesson = {
          id: Math.random().toString(36).substr(2, 9),
          title: formData.title || 'New Lesson',
          course: formData.course || { id: '1', title: 'React Fundamentals' },
          type: formData.type as 'video' || 'document',
          duration: formData.duration || '00:00',
          order: formData.order || 1,
          isPublished: formData.isPublished || false,
          createdAt: new Date().toISOString()
        };
        setLessons([newLesson, ...lessons]);
      }
      
      setIsModalOpen(false);
      setFormData({});
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  // Handle view test
  const handleViewTest = (test: Test) => {
    setSelectedLesson(test as unknown as Lesson);
    setIsModalOpen(true);
  };

  // Handle delete test
  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        // TODO: Replace with actual API call
        console.log('Deleting test:', testId);
        setTests(tests.filter(test => test.id !== testId));
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  // Handle edit test
  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setTestFormData({ ...test });
    setIsTestEditMode(true);
    setIsModalOpen(true);
  };

  // Handle test form input changes
  const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestFormData(prev => ({
      ...prev,
      [name]: name === 'passingScore' || name === 'totalQuestions' ? parseInt(value) || 0 : value
    }));
  };

  // Handle save test
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isTestEditMode && selectedTest) {
        // Update existing test
        const updatedTests = tests.map(test => 
          test.id === selectedTest.id ? { ...test, ...testFormData } as Test : test
        );
        setTests(updatedTests);
      } else {
        // Add new test
        const newTest: Test = {
          id: `test-${Date.now()}`,
          title: testFormData.title || 'New Test',
          course: testFormData.course || { id: 'course-1', title: 'Default Course' },
          duration: testFormData.duration || '30 min',
          passingScore: testFormData.passingScore || 70,
          totalQuestions: testFormData.totalQuestions || 10,
          isPublished: testFormData.isPublished || false,
          createdAt: new Date().toISOString(),
          description: testFormData.description || ''
        };
        setTests([...tests, newTest]);
      }
      
      setIsModalOpen(false);
      setTestFormData({});
      setSelectedTest(null);
      setIsTestEditMode(false);
    } catch (error) {
      console.error('Error saving test:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('lessons')}
            className={`px-4 py-2 font-medium text-sm rounded-md ${
              viewMode === 'lessons'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setViewMode('tests')}
            className={`px-4 py-2 font-medium text-sm rounded-md ${
              viewMode === 'tests'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tests
          </button>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Add {viewMode === 'lessons' ? 'Lesson' : 'Test'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'lessons' ? (
        // Existing lessons table
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            {/* Table headers */}
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Title
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Course
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Your existing lessons table rows */}
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-gray-500">{lesson.duration}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lesson.course.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                    {lesson.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      lesson.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewLesson(lesson)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditLesson(lesson)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Test Title
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Course
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Questions
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Passing Score
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                        {getTestIcon()}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{test.title}</div>
                        <div className="text-gray-500">{test.duration}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {test.course.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {test.totalQuestions}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {test.passingScore}%
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      test.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewTest(test)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditTest(test)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTest(test.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{viewMode === 'lessons' ? lessons.length : tests.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Previous</span>
                <span className="h-5 w-5" aria-hidden="true">«</span>
              </button>
              {/* Pagination numbers */}
              <button className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                3
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                <span className="sr-only">Next</span>
                <span className="h-5 w-5" aria-hidden="true">»</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isTestEditMode ? 'Edit Test' : isEditMode ? 'Edit Lesson' : 'Lesson Details'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedLesson(null);
                    setSelectedTest(null);
                    setIsEditMode(false);
                    setIsTestEditMode(false);
                    setFormData({});
                    setTestFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {isTestEditMode ? (
                <form onSubmit={handleSaveTest}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={testFormData.title || ''}
                        onChange={handleTestInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={testFormData.description || ''}
                        onChange={handleTestInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input
                          type="text"
                          name="duration"
                          value={testFormData.duration || ''}
                          onChange={handleTestInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                        <input
                          type="number"
                          name="passingScore"
                          value={testFormData.passingScore || ''}
                          onChange={handleTestInputChange}
                          min="0"
                          max="100"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Questions</label>
                        <input
                          type="number"
                          name="totalQuestions"
                          value={testFormData.totalQuestions || ''}
                          onChange={handleTestInputChange}
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center">
                          <input
                            id="isPublished"
                            name="isPublished"
                            type="checkbox"
                            checked={testFormData.isPublished || false}
                            onChange={(e) => setTestFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                            Published
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setIsTestEditMode(false);
                          setTestFormData({});
                        }}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : isEditMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                      <input
                        type="number"
                        name="order"
                        id="order"
                        min="1"
                        value={formData.order || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (mm:ss)</label>
                      <input
                        type="text"
                        name="duration"
                        id="duration"
                        placeholder="15:30"
                        value={formData.duration || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <div className="flex items-center h-5">
                        <input
                          id="isPublished"
                          name="isPublished"
                          type="checkbox"
                          checked={formData.isPublished || false}
                          onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                          Published
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add a detailed description of the lesson..."
                      value={formData.description || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setFormData({});
                      }}
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : selectedLesson ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                      {getLessonIcon(selectedLesson.type)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{selectedLesson.title}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedLesson.course.title} • {selectedLesson.duration}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedLesson.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order</p>
                      <p className="font-medium">{selectedLesson.order}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLesson.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedLesson.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">
                        {selectedLesson ? new Date(selectedLesson.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLesson?.description || 'No description available.'}
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => selectedLesson && handleEditLesson(selectedLesson)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedLesson) {
                          handleDeleteLesson(selectedLesson.id);
                          setIsModalOpen(false);
                        }
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : selectedTest ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">{selectedTest.title}</h4>
                  <p className="text-gray-600">{selectedTest.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Course</p>
                      <p className="font-medium">{selectedTest.course.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{selectedTest.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Passing Score</p>
                      <p className="font-medium">{selectedTest.passingScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Questions</p>
                      <p className="font-medium">{selectedTest.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTest.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedTest.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">
                        {new Date(selectedTest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedTest(null);
                      }}
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditTest(selectedTest)}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Test
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
