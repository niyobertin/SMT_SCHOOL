import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Save, X, BookOpen, Award, ImagePlus, Upload, Clock, Trash, Loader2, Eye, ArrowLeft, FileQuestion } from 'lucide-react';
import { fetchCourses } from "../../redux/features/courses/courseSlice";
import { fetchTestsByCourseId } from "../../redux/features/test/testSlice";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/stores';
import { addQuestion, createTest, deleteQuestion, deleteTest, fetchQuestionsByTestId, updateQuestion, updateTest } from '../../redux/features/test/manageTestslice';
import { Toast } from 'primereact/toast';
import StatusMessage from '../../components/ui/loadingAndError';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal';
import api from '../../redux/api/api';
import { FaQuestion } from 'react-icons/fa';


const TestQuestionManager = () => {
  const [currentTest, setCurrentTest] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<string>('GENERAL'); // Track test type
  const [isEditingTest, setIsEditingTest] = useState(false);
  const [creatingQuestionLoading, setCreatingQuestionLoading] = useState(false);
  const [creatingTestLoading, setCreatingTestLoading] = useState(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<any | null>(null);
  const [deletingQuestionLoading, setDeletingQuestionLoading] = useState(false);

  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionToEditId, setQuestionToEditId] = useState<string | null>(null);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const toast = useRef<Toast>(null);

  const defaultTest: any = {
    title: "",
    description: "",
    instructions: [
      ""
    ],
    duration: 0,
    passingScore: 0,
    maxAttempts: 0,
    randomizeQuestions: true,
    randomizeOptions: true,
    showResults: "AFTER_COMPLETION"
  }

  const defaultQuestion: any = {
    question: "",
    type: "MULTIPLE_CHOICE",
    points: 0,
    explanation: "",
    options: [
      {
        option: "",
        isCorrect: true
      }
    ],
    correctAnswer: ""
  }

  const { items: courses, loading, error } = useSelector((state: RootState) => state.courses);
  const { tests, loading: testsLoading, error: testsError } = useSelector((state: RootState) => state.test);
  const { questions, loading: questionsLoading, error: questionsError } = useSelector((state: RootState) => state.manageTest);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setExcelFile(file);
      setCurrentQuestion({ ...currentQuestion, image: file });
      // Only create preview if it’s an image
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchCourses({
      page: 1,
      limit: 10000
    }));
  }, [dispatch]);



  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchTestsByCourseId(selectedCourseId));
    }
  }, [dispatch, selectedCourseId]);



  const startCreatingTest = (courseId: string) => {
    if (!courseId) {
      console.error("No course ID provided for test creation");
      return;
    }
    setCurrentTest({
      ...defaultTest,
      courseId,
      id: Date.now().toString()
    });
    setSelectedCourseId(courseId);
    setActiveTab('test-editor');
  };

  const saveTest = async () => {
    try {
      if (!currentTest.courseId) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Please select a course for this test",
          life: 3000,
        });
        return;
      }

      if (isEditingTest) {
        await dispatch(updateTest({
          testData: currentTest,
          id: selectedTestId!
        })).unwrap();
      } else {
        setCreatingTestLoading(true);
        await dispatch(createTest({
          testData: currentTest,
          courseId: currentTest.courseId
        })).unwrap();
      }

      await dispatch(fetchTestsByCourseId(currentTest.courseId)).unwrap();
      toast.current?.show({
        severity: "success",
        summary: isEditingTest ? "Test Updated" : "Test Created",
        detail: isEditingTest ? "Test updated successfully!" : "Test created successfully!",
        life: 3000,
      });
      setActiveTab('tests');
    } catch (error) {
      console.error("Error creating test:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create test. Please try again.",
        life: 3000,
      });
    } finally {
      setCreatingTestLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTestId) {
      dispatch(fetchQuestionsByTestId(selectedTestId)).unwrap().then(() => {
        // Get the test type from the selected test
        const selectedTest = tests.find(t => t.id === selectedTestId);
        if (selectedTest) {
          setSelectedTestType(selectedTest.type || 'GENERAL');
        }
      }).catch((error) => {
        console.error("Error fetching questions:", error);
      });
    }
  }, [dispatch, selectedTestId, tests]);


  const startCreatingQuestion = () => {
    setCurrentQuestion({ ...defaultQuestion, id: Date.now().toString() });
    setIsCreatingQuestion(true);
  };


  const addOption = () => {
    setCurrentQuestion((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        options: [
          ...prev.options,
          {
            option: '',
            isCorrect: false
          }
        ]
      };
    });
  };

  const updateOption = (index: number, field: string, value: any) => {
    setCurrentQuestion((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        options: prev.options.map((opt: any, i: number) =>
          i === index ? { ...opt, [field]: value } :
            field === 'isCorrect' && value ? { ...opt, isCorrect: false } : opt
        )
      };
    });
  };

  const removeOption = (index: number) => {
    if (currentQuestion && currentQuestion.options.length > 2) {
      setCurrentQuestion((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          options: prev.options.filter((_: any, i: number) => i !== index).map((opt: any, _idx: number) => ({
            ...opt,
          }))
        };
      });
    }
  };

  const saveQuestion = async () => {
    setCreatingQuestionLoading(true);
    try {
      // Basic validation
      if (!currentQuestion || !currentQuestion.question.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: "Please fill out the question field.",
          life: 3000,
        });
        setCreatingQuestionLoading(false);
        return;
      }

      // Validate based on test type
      if (selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') {
        // For PSYCHOMETRIC and GENERAL, validate options
        if (!currentQuestion.options || !currentQuestion.options.some((opt: any) => opt.option.trim())) {
          toast.current?.show({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please add at least one option.",
            life: 3000,
          });
          setCreatingQuestionLoading(false);
          return;
        }
      } else if (selectedTestType === 'INTERVIEW') {
        // For INTERVIEW, validate solution/answer
        if (!currentQuestion.explanation || !currentQuestion.explanation.trim()) {
          toast.current?.show({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please provide a solution/answer for this interview question.",
            life: 3000,
          });
          setCreatingQuestionLoading(false);
          return;
        }
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("question", currentQuestion.question);
      formData.append("type", currentQuestion.type || "MULTIPLE_CHOICE");
      formData.append("points", currentQuestion.points);
      formData.append("explanation", currentQuestion.explanation || "");

      // Add image if present
      if (currentQuestion.image) {
        formData.append("fileImage", currentQuestion.image);
      }

      // Add options and correctAnswer only for PSYCHOMETRIC and GENERAL tests
      if (selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') {
        const correctAnswer =
          currentQuestion.options.find((opt: any) => opt.isCorrect)?.option || "";
        formData.append("correctAnswer", correctAnswer);

        // Add options
        currentQuestion.options.forEach((opt: any, index: number) => {
          formData.append(`options[${index}][isCorrect]`, String(opt.isCorrect === true || opt.isCorrect === "true"));
          formData.append(`options[${index}][option]`, opt.option);
        });
      } else {
        // For OPENENDED and INTERVIEW, set empty correctAnswer
        formData.append("correctAnswer", "");
      }

      if (isEditingQuestion && questionToEditId) {
        await dispatch(
          updateQuestion({ id: questionToEditId, questionData: formData })
        ).unwrap();
        await dispatch(fetchQuestionsByTestId(selectedTestId!)).unwrap();
        setQuestionToEditId(null);
        toast.current?.show({
          severity: "success",
          summary: "Updated",
          detail: "Question updated successfully!",
          life: 3000,
        });
      } else {
        await dispatch(addQuestion({ questionData: formData, testId: selectedTestId! })).unwrap();
        toast.current?.show({
          severity: "success",
          summary: "Question Added",
          detail: "The question has been added successfully.",
          life: 3000,
        });
      }

      await dispatch(fetchQuestionsByTestId(selectedTestId!)).unwrap();
      setCurrentQuestion(null);
      setIsCreatingQuestion(false);
      setIsEditingQuestion(false);
      setQuestionToEditId(null);

    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong while saving the question.",
        life: 3000,
      });
    } finally {
      setCreatingQuestionLoading(false);
    }
  };


  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await dispatch(deleteTest(testToDelete.id)).unwrap();
      await dispatch(fetchTestsByCourseId(selectedCourseId!)).unwrap();
      toast.current?.show({ severity: "success", summary: "Deleted", detail: "Test deleted successfully!", life: 3000 });
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to delete test.", life: 3000 });
    } finally {
      setShowDeleteModal(false);
      setTestToDelete(null);
    }
  };
  const handleEditQuestion = (question: any) => {
    setCurrentQuestion({ ...question });
    setQuestionToEditId(question.id);
    setIsEditingQuestion(true);
    setIsCreatingQuestion(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setDeletingQuestionLoading(true);
      await dispatch(deleteQuestion(questionId)).unwrap();
      await dispatch(fetchQuestionsByTestId(selectedTestId!)).unwrap();
      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: "Question deleted successfully!",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete question." + error,
        life: 10000,
      });
    } finally {
      setDeletingQuestionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="pb-4">
        <p className="text-gray-600">Create, manage and edit your tests and questions</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'courses', label: 'Courses', icon: BookOpen },
          { key: 'tests', label: 'Tests', icon: Award },
          { key: 'test-questions', label: 'Questions', icon: FileQuestion },
          { key: 'test-editor', label: 'Test Editor', icon: Edit }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            disabled
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <p className='text-center'>Loading courses...</p>}
            {error && <p className='text-center'>Error loading courses: {error}</p>}
            {(courses || []).map(course => (
              <div key={course.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">{course.description.slice(0, 50)}...</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startCreatingTest(course.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    <span className="whitespace-nowrap"> New Test</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('tests');
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                    <Eye size={14} />
                    <span className="whitespace-nowrap">View {course.tests?.length || 0} tests</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">All Tests</h2>
            <button
              onClick={() => {
                if (selectedCourseId) {
                  startCreatingTest(selectedCourseId);
                } else {
                  setActiveTab('courses');
                }
              }}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">New Test</span>
            </button>
          </div>

          {testsLoading && (
            <div className="flex items-center justify-center p-4">
              <StatusMessage type="loading" message="Loading tests..." />
            </div>
          )}

          {testsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <StatusMessage type="error" message={`Error loading tests: ${testsError}`} />
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-300 font-medium text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    Test Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Questions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Passing Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.map((test) => {
                  const course = (courses || []).find(c => c.id === test.courseId);
                  return (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{test.title}</div>
                        <div className="text-sm text-gray-500 w-64 truncate">{test.description ? test.description.substring(0, 100) + (test.description.length > 100 ? '...' : '') : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {course.title}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${test.type === 'PSYCHOMETRIC' ? 'bg-purple-100 text-purple-800' :
                          test.type === 'INTERVIEW' ? 'bg-green-100 text-green-800' :
                            test.type === 'OPENENDED' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {test.type || 'GENERAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaQuestion size={14} />
                          <span>{(test.questions || []).length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{test.duration} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Award size={14} />
                          <span>{test.passingScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setCurrentTest(test);
                              setIsEditingTest(true);
                              setSelectedTestId(test.id);
                              setActiveTab('test-editor');
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900"
                            title="Edit Test"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTestId(test.id);
                              setSelectedTestType(test.type || 'GENERAL');
                              setActiveTab('test-questions');
                            }}
                            className="p-2 text-green-600 hover:text-green-900"
                            title="View Questions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTestToDelete(test);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete Test"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Test Questions Tab */}
      {activeTab === 'test-questions' && (

        <div className="bg-white p-6">
          {questionsLoading && (
            <div className="flex justify-center items-center h-full">
              <StatusMessage type="loading" message="Loading questions..." />
            </div>
          )}
          {questionsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <StatusMessage type="error" message={`Error loading questions: ${questionsError}`} />
            </div>
          )}
          <div className="mb-4 flex">
            <button onClick={() => setActiveTab('tests')} className="text-blue-600 bg-blue-50 px-3 py-2 rounded hover:underline flex items-center gap-2"> <span><ArrowLeft size={16} /></span>Back to Tests</button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center justify-between">
              {questions.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold">
                    Questions ({questions.length})
                  </h3>
                </>
              )}
            </div>
            <button
              onClick={startCreatingQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            >
              <Plus size={16} />
              Add Question
            </button>

          </div>
          {questionsLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
          {!questionsLoading && questions.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p>No questions found</p>
            </div>
          )}
          {questions.map((question: any, index: any) => (
            <div key={index} className="gap-2 mb-2 border p-2 rounded">
              <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <p><span className="font-bold">{index + 1}.</span> {question.question}</p>
                  <span className="text-xs">({question.points} points)</span>
                </div>
                <div className="flex gap-2 items-center">

                  <button onClick={() =>
                    handleEditQuestion(question)}
                    className="ml-2 text-xs text-blue-600 hover:bg-indigo-200 bg-indigo-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2"><Edit size={24} />Edit</button>
                  <button onClick={() => {
                    setQuestionToDelete(question);
                    setIsDeleteModalOpen(true);
                  }}
                    className="ml-2 text-xs text-red-600 hover:bg-red-200 bg-red-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2"><Trash2 size={24} />Delete</button>
                </div>
              </div>
              <span className="ml-auto text-xs font-semibold">{question.type}</span>
              {question.image && (
                <img
                  src={question.image}
                  alt="Question Image"
                  className="mt-2 max-w-full h-auto"
                />
              )}
              <div className="block">
                <ul className="list-disc list-inside space-y-1">
                  {question.options.map((option: any, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {option.option}
                      {option.isCorrect && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          (Correct)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {/* Question Creator Modal */}
          {isCreatingQuestion && (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-blue-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileQuestion className="w-6 h-6" />
                    {isEditingQuestion ? 'Edit Question' : 'Create New Question'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setCurrentQuestion(null);
                      setIsEditingQuestion(false);
                      setQuestionToEditId(null);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                {/* Scrollable Content Area */}
                <div className="overflow-y-auto px-6 py-6 flex-1">
                  {/* Bulk Upload Section */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Bulk Upload from Excel
                    </h4>
                    <div className="flex gap-3 items-center">
                      <div className="relative group flex-1">
                        <label
                          htmlFor="excel-upload"
                          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Excel File
                        </label>
                        <input
                          id="excel-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setExcelFile(e.target.files[0]);
                          }}
                          className="hidden"
                        />
                        <div className="absolute left-0 mt-2 w-auto p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <p className="font-semibold mb-2">Excel Format</p>
                          <table className="w-full border border-gray-600 border-collapse text-[11px]">
                            <thead className="bg-gray-700 text-white">
                              <tr>
                                <th className="border border-gray-600 py-1 px-2">question</th>
                                <th className="border border-gray-600 py-1 px-2">type</th>
                                <th className="border border-gray-600 py-1 px-2">points</th>
                                <th className="border border-gray-600 py-1 px-2">explanation</th>
                                <th className="border border-gray-600 py-1 px-2">options</th>
                                <th className="border border-gray-600 py-1 px-2">correct</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="even:bg-gray-800/30">
                                <td className="border border-gray-600 py-1 px-2">Question?</td>
                                <td className="border border-gray-600 py-1 px-2">Choice</td>
                                <td className="border border-gray-600 py-1 px-2">2</td>
                                <td className="border border-gray-600 py-1 px-2">Explanation</td>
                                <td className="border border-gray-600 py-1 px-2">A,B,C,D</td>
                                <td className="border border-gray-600 py-1 px-2">B</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <button
                        disabled={!excelFile || uploading}
                        onClick={async () => {
                          if (!excelFile) return;
                          setUploading(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", excelFile);
                            const response = await api.post(`/tests/${selectedTestId}/questions/upload`, formData, {
                              headers: { "Content-Type": "multipart/form-data" },
                            });
                            toast.current?.show({
                              severity: "success",
                              summary: "Success",
                              detail: response.data.message || "Questions uploaded successfully!",
                              life: 3000,
                            });
                            setExcelFile(null);
                            await dispatch(fetchQuestionsByTestId(selectedTestId!)).unwrap();
                          } catch (err) {
                            toast.current?.show({
                              severity: "error",
                              summary: "Error",
                              detail: (err as any).response?.data?.message || "Upload failed.",
                              life: 3000,
                            });
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 ${uploading || !excelFile ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>
                    {excelFile && (
                      <p className="text-sm text-green-700 mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Selected: <span className="font-semibold">{excelFile.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6"></div>

                  {/* Image Upload Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Question Image (Optional)</label>
                    <label
                      htmlFor="image-upload"
                      className="group relative w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 overflow-hidden"
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium">Click to change image</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImagePlus className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                          <p className="text-gray-600 group-hover:text-blue-600 font-medium text-sm transition-colors">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5 MB</p>
                        </>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {/* Question Text */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      Question Text
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentQuestion?.question}
                      onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, question: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                      placeholder="Enter your question here..."
                      rows={3}
                    />
                  </div>

                  {/* Points and Type */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
                      <input
                        type="number"
                        value={currentQuestion?.points}
                        onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, points: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {(selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                        <select
                          value={currentQuestion?.type}
                          onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                        >
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Explanation for PSYCHOMETRIC and GENERAL */}
                  {(selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Explanation <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={currentQuestion?.explanation}
                        onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, explanation: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                        placeholder="Optional explanation shown after answering"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Solution/Answer for INTERVIEW tests */}
                  {selectedTestType === 'INTERVIEW' && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Solution/Answer
                        <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 font-normal ml-2">(Shown to students)</span>
                      </label>
                      <textarea
                        value={currentQuestion?.explanation}
                        onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, explanation: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                        placeholder="Enter the solution or answer for this question"
                        rows={4}
                        required
                      />
                    </div>
                  )}

                  {/* Options section - only for PSYCHOMETRIC and GENERAL tests */}
                  {(selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') && (
                    <>
                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-semibold text-gray-700">Answer Options</label>
                          <button
                            onClick={addOption}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Plus size={16} />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(currentQuestion?.options || []).map((option: any, index: any) => {
                            const letter = String.fromCharCode(65 + index);
                            return (
                              <div key={index} className="flex items-center gap-3 group">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md">
                                  {letter}
                                </div>
                                <div className="relative flex-1">
                                  <input
                                    type="radio"
                                    name="correct-option"
                                    checked={option.isCorrect}
                                    onChange={() => updateOption(index, 'isCorrect', true)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                                  />
                                  <input
                                    type="text"
                                    value={option.option}
                                    onChange={(e) => updateOption(index, 'option', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${option.isCorrect
                                      ? 'border-green-400 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                      }`}
                                    placeholder={`Enter option ${letter}`}
                                  />
                                </div>
                                {(currentQuestion?.options || []).length > 2 && (
                                  <button
                                    onClick={() => removeOption(index)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Remove option"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Select the radio button to mark the correct answer
                        </p>
                      </div>

                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={currentQuestion?.options?.find((opt: any) => opt.isCorrect)?.option || ''}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-green-50 text-green-800 font-medium"
                            placeholder="Automatically filled based on selected option"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                            <Award size={20} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setCurrentQuestion(null);
                      setIsEditingQuestion(false);
                      setQuestionToEditId(null);
                    }}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuestion}
                    disabled={creatingQuestionLoading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${creatingQuestionLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      }`}
                  >
                    {creatingQuestionLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {isEditingQuestion ? 'Update Question' : 'Save Question'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Test Editor Tab */}
      {activeTab === 'test-editor' && (
        <div className="space-y-6">
          {!currentTest ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No test selected for editing</p>
              <button
                onClick={() => startCreatingTest(currentTest.courseId)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Create New Test
              </button>
            </div>
          ) : (
            <>
              {/* Test Settings */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-blue-600" />
                  Test Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      Test Title
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentTest.title}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="Enter test title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                    <select
                      value={currentTest.courseId || selectedCourseId || ''}
                      onChange={(e) => {
                        const courseId = e.target.value;
                        setCurrentTest((prev: any) => ({
                          ...prev,
                          courseId: courseId ? courseId : null
                        }));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                      required
                    >
                      <option value="">Select Course</option>
                      {(courses || []).map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Type</label>
                    <select
                      value={currentTest.type || ''}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                    >
                      <option value="">All</option>
                      <option value="GENERAL">GENERAL</option>
                      <option value="PSYCHOMETRIC">PSYCHOMETRIC</option>
                      <option value="OPENENDED">OPENENDED</option>
                      <option value="INTERVIEW">INTERVIEW</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={currentTest.description}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                      placeholder="Enter test description"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={currentTest.instructions?.join('\n') || ''}
                      onChange={(e) =>
                        setCurrentTest((prev: any) => ({
                          ...prev,
                          instructions: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                      placeholder="Enter test instructions (one per line)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentTest.duration}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Award className="w-4 h-4 text-blue-600" />
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={currentTest.passingScore}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Attempts</label>
                    <input
                      type="number"
                      value={currentTest.maxAttempts}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Show Results</label>
                    <select
                      value={currentTest.showResults}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, showResults: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                    >
                      <option value="AFTER_COMPLETION">After Completion</option>
                      <option value="IMMEDIATELY">Immediately</option>
                      <option value="NEVER">Never</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-6 p-4 bg-white rounded-xl border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentTest.randomizeQuestions}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeQuestions: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Randomize Questions</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentTest.randomizeOptions}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeOptions: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Randomize Options</span>
                  </label>
                </div>

              </div>

              {/* Save Test */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setCurrentTest(null);
                    setActiveTab('courses');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTest}
                  disabled={creatingTestLoading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${creatingTestLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                >
                  {creatingTestLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Test
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {/* ===== Delete Confirmation Modal ===== */}
      {showDeleteModal && testToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Delete Test</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{testToDelete.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTest}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (questionToDelete) {
            handleDeleteQuestion(questionToDelete.id);
            setQuestionToDelete(null);
          }
        }}
        title="Delete Question"
        message={`Are you sure you want to delete "${questionToDelete?.question}"? This action cannot be undone.`}
        loading={deletingQuestionLoading}
      />

      <Toast ref={toast} position="top-right" />
    </div>
  );
};

export default TestQuestionManager;