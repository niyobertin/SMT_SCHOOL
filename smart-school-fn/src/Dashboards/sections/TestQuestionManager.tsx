import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Save, X, BookOpen, Award, ImagePlus, Upload, Clock, Users, Trash, Loader2, Eye, ArrowLeft, FileQuestion } from 'lucide-react';
import { fetchCourses } from "../../redux/features/courses/courseSlice";
import { fetchTestsByCourseId } from "../../redux/features/test/testSlice";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/stores';
import { addQuestion, createTest, deleteQuestion, deleteTest, fetchQuestionsByTestId, updateQuestion, updateTest } from '../../redux/features/test/manageTestslice';
import { Toast } from 'primereact/toast';
import StatusMessage from '../../components/ui/loadingAndError';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal';
import api from '../../redux/api/api';


const TestQuestionManager = () => {
  const [currentTest, setCurrentTest] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
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
    setCurrentTest({ ...defaultTest, courseId, id: Date.now().toString() });
    setActiveTab('test-editor');
  };

  const saveTest = async () => {
    try {
      if (isEditingTest) {
        await dispatch(updateTest({ testData: currentTest, id: selectedTestId! })).unwrap();
      } else {
        setCreatingTestLoading(true);
        await dispatch(createTest({ testData: currentTest, courseId: selectedCourseId! })).unwrap();
      }
      await dispatch(fetchTestsByCourseId(selectedCourseId!)).unwrap();
      toast.current?.show({
        severity: "success",
        summary: "Test Created",
        detail: "Test created successfully!",
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
      }).catch((error) => {
        console.error("Error fetching questions:", error);
      });
    }
  }, [dispatch, selectedTestId]);


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
      if (
        !currentQuestion ||
        !currentQuestion.question.trim() ||
        !currentQuestion.options.some((opt: any) => opt.option.trim())
      ) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: "Please fill out the question and at least one option.",
          life: 3000,
        });
        return;
      }

      const correctAnswer =
        currentQuestion.options.find((opt: any) => opt.isCorrect)?.option || "";
      // Convert to FormData
      const formData = new FormData();
      formData.append("question", currentQuestion.question);
      formData.append("type", currentQuestion.type);
      formData.append("points", currentQuestion.points);
      formData.append("explanation", currentQuestion.explanation || "");
      formData.append("correctAnswer", correctAnswer);
      // Add image if present
      if (currentQuestion.image) {
        formData.append("fileImage", currentQuestion.image);
      }
      // Add options
      currentQuestion.options.forEach((opt: any, index: number) => {
        formData.append(`options[${index}][isCorrect]`, String(opt.isCorrect === true || opt.isCorrect === "true"));
        formData.append(`options[${index}][option]`, opt.option);
      });
      if (isEditingQuestion && questionToEditId) {
        await dispatch(
          updateQuestion({ questionData: formData, id: questionToEditId })
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
                    Create Test
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('tests');
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                    <Eye size={14} />
                    View {course.tests && (course.tests || []).length} tests
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
            <h2 className="text-2xl font-bold mb-4">All Tests</h2>
            <button
              onClick={() => {
                if (selectedCourseId) {
                  startCreatingTest(selectedCourseId);
                  return;
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus size={16} />
              Create New Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testsLoading && (
              <div className="flex items-center justify-center p-4">
                <StatusMessage type="loading" message="Loading tests..." />
              </div>
            )}

            {testsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <StatusMessage type="error" message={`Error loading tests: ${testsError}`} />
              </div>
            )}
            {(tests || []).map(test => {
              const course = (courses || []).find(c => c.id === test.courseId);
              return (
                <div key={test.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{test.title}</h3>
                  <p className="text-gray-600 mb-2">{test.description}</p>
                  {course && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded mb-2">
                      {course.title}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {(test.questions || []).length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {test.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      {test.passingScore}% to pass
                    </span>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-2">
                    <button
                      onClick={() => {
                        setCurrentTest(test);
                        setIsEditingTest(true);
                        setSelectedTestId(test.id);
                        setActiveTab('test-editor');
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setActiveTab('test-questions');
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                    >
                      <Eye size={16} />
                      View Questions
                    </button>
                    <button
                      onClick={() => {
                        setTestToDelete(test);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                    >
                      <Trash size={16} />
                      Delete
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Test Questions Tab */}
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
            <div className="fixed inset-0 bg-gray-700/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Create Question</h3>
                  <button
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setCurrentQuestion(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <div className="relative group">
                    <label
                      htmlFor="excel-upload"
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Excel
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

                    <div className="absolute mt-2 w-auto p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p className="font-semibold mb-2">Excel Format</p>
                      <table className="w-full border border-gray-600 border-collapse text-[11px]">
                        <thead className="bg-gray-700 text-white">
                          <tr>
                            <th className="border border-gray-600 py-1 px-2">Question</th>
                            <th className="border border-gray-600 py-1 px-2">Type</th>
                            <th className="border border-gray-600 py-1 px-2">Points</th>
                            <th className="border border-gray-600 py-1 px-2">Explanation(optional)</th>
                            <th className="border border-gray-600 py-1 px-2">Options</th>
                            <th className="border border-gray-600 py-1 px-2">Correct</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="even:bg-gray-800/30">
                            <td className="border border-gray-600 py-1 px-2 font-medium">Question?</td>
                            <td className="border border-gray-600 py-1 px-2">Choice type</td>
                            <td className="border border-gray-600 py-1 px-2 font-medium">2</td>
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
                        console.log(response.data);
                        setExcelFile(null);
                      } catch (err) {
                        console.error(err);
                        toast.current?.show({
                          severity: "error",
                          summary: "Error",
                          detail: (err as any).response?.data?.message || "Upload failed. Check console for details.",
                          life: 3000,
                        });
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer rounded text-white ${uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {uploading ? "Uploading..." : "Send to Server"}
                  </button>
                </div>
                {excelFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: <span className="font-medium">{excelFile.name}</span>
                  </p>
                )}
                <div className="h-[200px] w-[150px]">
                  <label
                    htmlFor="image-upload"
                    className="group relative w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded-xl object-cover w-full h-full"
                      />
                    ) : (
                      <>
                        <ImagePlus className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3" />
                        <p className="text-gray-600 group-hover:text-blue-600 font-normal text-sm text-center">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-400 text-center">PNG, JPG, GIF up to 5 MB</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question *</label>
                    <textarea
                      value={currentQuestion?.question}
                      onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, question: e.target.value }))}
                      className="w-full p-2 border rounded h-20"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Points</label>
                      <input
                        type="number"
                        value={currentQuestion?.points}
                        onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, points: parseInt(e.target.value) }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={currentQuestion?.type}
                        onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation</label>
                    <textarea
                      value={currentQuestion?.explanation}
                      onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, explanation: e.target.value }))}
                      className="w-full p-2 border rounded h-16"
                      placeholder="Optional explanation shown after answering"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Options</label>
                      <button
                        onClick={addOption}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded"
                      >
                        <Plus size={14} />
                        Add Option
                      </button>
                    </div>

                    {(currentQuestion?.options || []).map((option: any, index: any) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={option.isCorrect}
                          onChange={() => updateOption(index, 'isCorrect', true)}
                        />
                        <input
                          type="text"
                          value={option.option}
                          onChange={(e) => updateOption(index, 'option', e.target.value)}
                          className="flex-1 p-2 border rounded"
                          placeholder={`Option ${index + 1}`}
                        />
                        {(currentQuestion?.options || []).length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Correct Answer</label>
                    <input
                      type="text"
                      value={currentQuestion?.correctAnswer}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder={`${currentQuestion?.correctAnswer || ''} Automatically filled based on selected correct option`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => {
                        setIsCreatingQuestion(false);
                        setCurrentQuestion(null);
                      }}
                      className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveQuestion}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Save size={16} />
                      {creatingQuestionLoading ? 'Saving...' : isCreatingQuestion ? 'Save Question' : 'Update Question'}
                    </button>
                  </div>
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Test Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Title *</label>
                    <input
                      type="text"
                      value={currentTest.title}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 border rounded"
                      placeholder="Enter test title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course</label>
                    <select
                      value={currentTest.courseId || ''}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, courseId: parseInt(e.target.value) || null }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">No Course</option>
                      {(courses || []).map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={currentTest.description}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border rounded h-20"
                      placeholder="Enter test description"
                    />
                    <label className="block text-sm font-medium mb-2">Instructions</label>
                    <textarea
                      value={currentTest.instructions?.join('\n') || ''}
                      onChange={(e) =>
                        setCurrentTest((prev: any) => ({
                          ...prev,
                          instructions: e.target.value.split('\n'),
                        }))
                      }
                      className="w-full p-2 border rounded h-20"
                      placeholder="Enter test instructions (one per line)"
                    />

                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={currentTest.duration}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                    <input
                      type="number"
                      value={currentTest.passingScore}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Attempts</label>
                    <input
                      type="number"
                      value={currentTest.maxAttempts}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Show Results</label>
                    <select
                      value={currentTest.showResults}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, showResults: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="AFTER_COMPLETION">After Completion</option>
                      <option value="IMMEDIATELY">Immediately</option>
                      <option value="NEVER">Never</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentTest.randomizeQuestions}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeQuestions: e.target.checked }))}
                      className="mr-2"
                    />
                    Randomize Questions
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentTest.randomizeOptions}
                      onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeOptions: e.target.checked }))}
                      className="mr-2"
                    />
                    Randomize Options
                  </label>
                </div>

              </div>

              {/* Save Test */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setCurrentTest(null);
                    setActiveTab('courses');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTest}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save size={16} />
                  {creatingTestLoading ? 'Loading...' : 'Save Test'}
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