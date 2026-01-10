import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Save, X, BookOpen, Award, ImagePlus, Upload, Clock, Trash, Loader2, Eye, ArrowLeft, FileQuestion, ChevronRight, Search, Layout, Settings, FileText, CheckCircle2 } from 'lucide-react';
import { fetchCourses } from "../../redux/features/courses/courseSlice";
import { fetchTestsByCourseId } from "../../redux/features/test/testSlice";
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppDispatch, RootState } from '../../redux/stores';
import { addQuestion, createTest, deleteQuestion, deleteTest, fetchQuestionsByTestId, updateQuestion, updateTest } from '../../redux/features/test/manageTestslice';
import { Toast } from 'primereact/toast';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal';
import api from '../../redux/api/api';


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
  const { tests, loading: testsLoading } = useSelector((state: RootState) => state.test);
  const { questions, loading: questionsLoading } = useSelector((state: RootState) => state.manageTest);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Assessment Lab</h1>
          <p className="text-slate-500 font-medium mt-3 text-sm">Design high-impact tests and evaluate candidate knowledge.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Active Test Context: {currentTest?.title || 'None Selected'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100/50 p-1 rounded-xl inline-flex items-center gap-1 w-full lg:w-auto">
        {[
          { key: 'courses', label: 'Curriculum', icon: Layout },
          { key: 'tests', label: 'Assessments', icon: Award },
          { key: 'test-questions', label: 'Question Bank', icon: FileQuestion },
          { key: 'test-editor', label: 'Studio Editor', icon: Settings }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'tests' && !selectedCourseId) return;
              if (key === 'test-questions' && !selectedTestId) return;
              if (key === 'test-editor' && !currentTest && !selectedCourseId) return;
              setActiveTab(key);
            }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === key
              ? 'bg-white text-[#1a7ea5] shadow-lg shadow-[#1a7ea5]/5 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              } ${((key === 'tests' && !selectedCourseId) || (key === 'test-questions' && !selectedTestId)) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Curriculum</h2>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search courses..." className="w-full pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-2xl" />
                ))
              )}
              {error && <p className='text-center col-span-full py-12 text-rose-500 font-bold'>Error loading courses: {error}</p>}
              {!loading && (courses || []).map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white border border-slate-100 rounded-[32px] p-2 shadow-[0_15px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 bg-[#1a7ea5]/10 rounded-2xl flex items-center justify-center text-[#1a7ea5] mb-6 group-hover:scale-110 transition-transform duration-500">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3 leading-tight">{course.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">{course.description}</p>

                    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assessments</span>
                        <span className="text-lg font-black text-slate-900">{course.tests?.length || 0}</span>
                      </div>
                      <button
                        onClick={() => startCreatingTest(course.id)}
                        className="w-10 h-10 bg-[#1a7ea5] text-white rounded-xl flex items-center justify-center hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all"
                        title="Quick Add Test"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('tests');
                    }}
                    className="absolute inset-0 bg-[#1a7ea5]/0 group-hover:bg-[#1a7ea5]/[0.02] cursor-pointer transition-colors"
                  />

                  <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#1a7ea5] shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tests Tab (Assessments) */}
        {activeTab === 'tests' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Assessments Pipeline</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-500">Filtered by:</span>
                  <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold tracking-widest text-[#1a7ea5] uppercase">
                    {(courses || []).find(c => c.id === selectedCourseId)?.title || 'All Projects'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedCourseId) startCreatingTest(selectedCourseId);
                  else setActiveTab('courses');
                }}
                className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all shrink-0"
              >
                <Plus size={16} />
                New Assessment
              </button>
            </div>

            {testsLoading && (
              <div className="h-96 bg-slate-50 animate-pulse rounded-2xl" />
            )}

            {!testsLoading && (
              <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto px-4 pb-4">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment Title</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrics</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tests.map((test, idx) => (
                        <motion.tr
                          key={test.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 transition-all">
                                <FileText size={16} />
                              </div>
                              <div className="max-w-[200px]">
                                <div className="text-sm font-bold text-slate-900 truncate" title={test.title}>{test.title}</div>
                                <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{test.description || 'No description provided.'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${test.type === 'PSYCHOMETRIC' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                              test.type === 'INTERVIEW' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                test.type === 'OPENENDED' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                  'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}>
                              {test.type || 'GENERAL'}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-600 text-xs">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="text-emerald-500" size={12} />
                              <span>{(test.questions || []).length} Items</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{test.duration} MIN</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1a7ea5]" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Deployed</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedTestId(test.id);
                                  setSelectedTestType(test.type || 'GENERAL');
                                  setActiveTab('test-questions');
                                }}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="View Questions"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentTest(test);
                                  setIsEditingTest(true);
                                  setSelectedTestId(test.id);
                                  setActiveTab('test-editor');
                                }}
                                className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-[#1a7ea5] hover:border-[#1a7ea5]/20 rounded-lg transition-all shadow-sm"
                                title="Edit Config"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setTestToDelete(test);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-lg transition-all shadow-sm"
                                title="Purge"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {tests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                                <Award size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">No assessments found</h3>
                              <p className="text-slate-400 font-medium mt-2 text-sm">Initialize the evaluation pipeline for this curriculum.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {/* Test Questions Tab (Question Bank) */}
        {activeTab === 'test-questions' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="flex items-center gap-2 text-[#1a7ea5] mb-2 hover:-translate-x-1 transition-transform"
                >
                  <ArrowLeft size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">Back to Assessments</span>
                </button>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Question Portfolio</h2>
              </div>
              <button
                onClick={startCreatingQuestion}
                className="flex items-center gap-2 px-5 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all shrink-0"
              >
                <Plus size={16} />
                Create Question
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileQuestion size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5]">Deployment Context</span>
                    <h3 className="text-base font-bold text-slate-900 leading-none mt-1">
                      {tests.find(t => t.id === selectedTestId)?.title || 'Selected Module'}
                    </h3>
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Questions: {questions.length}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {questionsLoading && (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-xl" />
                    ))
                  )}

                  {!questionsLoading && questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <FileQuestion size={48} className="mb-4 opacity-50" />
                      <p className="font-bold">No questions found for this context.</p>
                    </div>
                  )}

                  {!questionsLoading && questions.map((question: any, index: number) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-xl border border-slate-50 hover:border-[#1a7ea5]/20 hover:shadow-xl transition-all p-5"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-8 h-8 rounded-lg bg-[#1a7ea5]/5 flex items-center justify-center text-[#1a7ea5] font-black text-xs">
                              {index + 1}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {question.type}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg text-[10px] font-black text-amber-600 uppercase tracking-widest">
                              <Award size={10} />
                              <span>{question.points} PTS</span>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-4">{question.question}</h3>

                          {question.image && (
                            <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 max-w-sm">
                              <img src={question.image} alt="Question Asset" className="w-full h-auto" />
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(question.options || []).map((option: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${option.isCorrect
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold'
                                  : 'bg-slate-50/50 border-slate-100 text-slate-500'
                                  }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${option.isCorrect ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                {option.option}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 transition-all">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#1a7ea5] hover:border-[#1a7ea5]/20 rounded-xl transition-all shadow-sm"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setQuestionToDelete(question);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Question Creator Modal */}
        <AnimatePresence>
          {isCreatingQuestion && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 md:p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a7ea5] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1a7ea5]/20">
                      <FileQuestion size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1a7ea5]">Design Studio</span>
                      <h3 className="text-xl font-black text-slate-900 leading-none mt-1">
                        {isEditingQuestion ? 'Modify Question' : 'Architect Question'}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setCurrentQuestion(null);
                      setIsEditingQuestion(false);
                      setQuestionToEditId(null);
                    }}
                    className="w-10 h-10 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-all hover:rotate-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto px-6 py-6 flex-1 custom-scrollbar space-y-10">
                  {/* Grid Layout for Meta and Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Core Data */}
                    <div className="lg:col-span-12 space-y-8">
                      {/* Bulk Upload Strip */}
                      <div className="bg-emerald-50/50 rounded-[32px] border border-emerald-100/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Upload size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Bulk Precision Upload</h4>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Import from Excel Schema</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <label className="flex-1 md:flex-none relative cursor-pointer group">
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) setExcelFile(e.target.files[0]);
                              }}
                            />
                            <div className="px-6 py-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-all text-center">
                              {excelFile ? excelFile.name : 'Select Workbook'}
                            </div>
                          </label>
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
                            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-30"
                          >
                            {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Execute Import'}
                          </button>
                        </div>
                      </div>

                      {/* Main Question Editor */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Question Content *</label>
                            <textarea
                              value={currentQuestion?.question}
                              onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, question: e.target.value }))}
                              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all resize-none shadow-sm"
                              placeholder="Draft the core question prompt..."
                              rows={4}
                            />
                          </div>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Complexity / Type</label>
                              <select
                                value={currentQuestion?.type}
                                onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, type: e.target.value }))}
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all appearance-none cursor-pointer shadow-sm"
                              >
                                <option value="MULTIPLE_CHOICE">MULTIPLE CHOICE</option>
                                <option value="TRUE_FALSE">TRUE / FALSE</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Knowledge Weight (PTS)</label>
                              <div className="relative">
                                <Award className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                  type="number"
                                  value={currentQuestion?.points}
                                  onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, points: parseInt(e.target.value) }))}
                                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Media Asset Section */}
                        <div className="bg-slate-50/50 rounded-[32px] p-6 border border-dashed border-slate-200">
                          <div className="flex items-center gap-2 mb-4">
                            <ImagePlus size={16} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supporting Media (Optional)</span>
                          </div>
                          <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-48 h-32 bg-white rounded-2xl border border-slate-100 overflow-hidden relative group">
                              {previewUrl ? (
                                <>
                                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                  <ImagePlus size={32} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                              <p className="text-xs text-slate-500 font-medium">Attach an image to provide visual context for this question. Supported formats: JPG, PNG (Max 5MB).</p>
                              <label className="inline-block relative cursor-pointer group">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                <div className="px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all">
                                  {previewUrl ? 'Replace Asset' : 'Inject Image'}
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Reasoning / Explanation */}
                        {(selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL' || selectedTestType === 'INTERVIEW') && (
                          <div className="bg-amber-50/30 rounded-[32px] p-8 border border-amber-100/50">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/10">
                                <Settings size={18} />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                                  {selectedTestType === 'INTERVIEW' ? 'Proprietary Solution' : 'Pedagogical Reasoning'}
                                </h4>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Visible post-assessment feedback</p>
                              </div>
                            </div>
                            <textarea
                              value={currentQuestion?.explanation}
                              onChange={(e) => setCurrentQuestion((prev: any) => ({ ...prev, explanation: e.target.value }))}
                              className="w-full px-6 py-4 bg-white border border-amber-100/50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all resize-none"
                              placeholder={selectedTestType === 'INTERVIEW' ? "Define the expected ideal response..." : "Elaborate on why the correct answer is valid..."}
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Options System for Choice-based tests */}
                        {(selectedTestType === 'PSYCHOMETRIC' || selectedTestType === 'GENERAL') && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#1a7ea5] rounded-full" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Logic Options</h4>
                              </div>
                              <button
                                onClick={addOption}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-slate-900/10 transition-all"
                              >
                                <Plus size={14} />
                                Extend Set
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(currentQuestion?.options || []).map((option: any, index: number) => (
                                <div key={index} className="group relative bg-white border border-slate-100 rounded-[24px] p-2 pr-12 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${option.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                      {String.fromCharCode(65 + index)}
                                    </div>
                                    <input
                                      type="text"
                                      value={option.option}
                                      onChange={(e) => updateOption(index, 'option', e.target.value)}
                                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none transition-all shadow-sm"
                                      placeholder={`Option ${String.fromCharCode(65 + index)}...`}
                                    />
                                  </div>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                      onClick={() => updateOption(index, 'isCorrect', true)}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${option.isCorrect ? 'bg-emerald-50 text-emerald-500' : 'text-slate-200 hover:text-slate-400'}`}
                                    >
                                      <CheckCircle2 size={18} />
                                    </button>
                                    {(currentQuestion?.options || []).length > 2 && (
                                      <button
                                        onClick={() => removeOption(index)}
                                        className="w-8 h-8 text-rose-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3 items-center">
                  <div className="hidden md:flex items-center gap-2 mr-auto">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validation Active</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setCurrentQuestion(null);
                      setIsEditingQuestion(false);
                      setQuestionToEditId(null);
                    }}
                    className="px-8 py-3.5 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all font-black"
                  >
                    Abort
                  </button>
                  <button
                    onClick={saveQuestion}
                    disabled={creatingQuestionLoading}
                    className="flex items-center gap-2 px-10 py-3.5 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all disabled:opacity-50"
                  >
                    {creatingQuestionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isEditingQuestion ? 'Update Schematic' : 'Commit Question'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Test Editor Tab (Studio Editor) */}
        {activeTab === 'test-editor' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            {!currentTest ? (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-300 shadow-sm mb-6">
                  <Settings size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Active Session</h3>
                <p className="text-slate-400 font-medium mt-2 mb-8">Select a curriculum to initialize the studio editor.</p>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="px-8 py-3.5 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all"
                >
                  Browse Curriculum
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Configuration Card */}
                <div className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <Settings size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Global Configuration</span>
                      <h3 className="text-base font-black text-slate-900 leading-none mt-1">Assessment Parameters</h3>
                    </div>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Assessment Identity *</label>
                      <input
                        type="text"
                        value={currentTest.title}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, title: e.target.value }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                        placeholder="e.g. Advanced Frontend Architecture"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Classification</label>
                      <select
                        value={currentTest.type || ''}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, type: e.target.value }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="GENERAL">GENERAL</option>
                        <option value="PSYCHOMETRIC">PSYCHOMETRIC</option>
                        <option value="OPENENDED">OPENENDED</option>
                        <option value="INTERVIEW">INTERVIEW</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Project Objective</label>
                      <textarea
                        value={currentTest.description}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, description: e.target.value }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all resize-none shadow-sm"
                        placeholder="Describe the core objectives of this assessment..."
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Candidate Instructions (One per line)</label>
                      <textarea
                        value={currentTest.instructions?.join('\n') || ''}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, instructions: e.target.value.split('\n') }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all resize-none shadow-sm"
                        placeholder="Instructions to be displayed before commencement..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Clock size={12} />
                        Duration Limit (Min)
                      </label>
                      <input
                        type="number"
                        value={currentTest.duration}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Award size={12} />
                        Benchmark Score (%)
                      </label>
                      <input
                        type="number"
                        value={currentTest.passingScore}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Search size={12} />
                        Result Visibility
                      </label>
                      <select
                        value={currentTest.showResults}
                        onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, showResults: e.target.value }))}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/5 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="AFTER_COMPLETION">After Completion</option>
                        <option value="IMMEDIATELY">Immediately</option>
                        <option value="NEVER">Never</option>
                      </select>
                    </div>
                  </div>

                  <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex flex-wrap gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={currentTest.randomizeQuestions}
                          onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeQuestions: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${currentTest.randomizeQuestions ? 'bg-[#1a7ea5]' : 'bg-slate-200'}`} />
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${currentTest.randomizeQuestions ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Shuffle items</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={currentTest.randomizeOptions}
                          onChange={(e) => setCurrentTest((prev: any) => ({ ...prev, randomizeOptions: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${currentTest.randomizeOptions ? 'bg-[#1a7ea5]' : 'bg-slate-200'}`} />
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${currentTest.randomizeOptions ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Shuffle options</span>
                    </label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setCurrentTest(null);
                      setActiveTab('tests');
                    }}
                    className="px-8 py-3.5 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={saveTest}
                    disabled={creatingTestLoading}
                    className="flex items-center gap-2 px-10 py-3.5 bg-[#1a7ea5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#1a7ea5]/20 transition-all disabled:opacity-50"
                  >
                    {creatingTestLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Commit Assessment
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Delete Confirmation Modal ===== */}
      <AnimatePresence>
        {showDeleteModal && testToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto mb-8">
                <Trash size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-4">Purge Assessment?</h3>
              <p className="text-slate-500 font-medium mb-10">
                You are about to delete <span className="text-slate-900 font-bold">"{testToDelete.title}"</span>. This operation is destructive and cannot be reversed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Safe Exit
                </button>
                <button
                  onClick={handleDeleteTest}
                  className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Confirm Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
};

export default TestQuestionManager;