import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Save, X, Award, Clock, Users, Trash, Loader2, Eye, FileQuestion, Filter, Upload, ImagePlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/stores';
import { addQuestion, createTest, deleteQuestion, deleteTest, fetchQuestionsByTestId, updateQuestion, updateTest } from '../../redux/features/test/manageTestslice';
import { Toast } from 'primereact/toast';
import StatusMessage from '../../components/ui/loadingAndError';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal';
import api from '../../redux/api/api';

const StandaloneTestManager = () => {
    const [standaloneTests, setStandaloneTests] = useState<any[]>([]);
    const [currentTest, setCurrentTest] = useState<any | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('tests');
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [isEditingTest, setIsEditingTest] = useState(false);
    const [creatingQuestionLoading, setCreatingQuestionLoading] = useState(false);
    const [creatingTestLoading, setCreatingTestLoading] = useState(false);
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [testToDelete, setTestToDelete] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<'ALL' | 'PSYCHOMETRIC' | 'INTERVIEW'>('ALL');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [solutionPreviewUrl, setSolutionPreviewUrl] = useState<string | null>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);

    const { questions, loading: questionsLoading, error: questionsError } = useSelector((state: RootState) => state.manageTest);

    const defaultTest: any = {
        title: "",
        description: "",
        testType: "PSYCHOMETRIC",
        instructions: [""],
        duration: 30,
        passingScore: 70,
        maxAttempts: 3,
        randomizeQuestions: true,
        showResults: true
    };

    const defaultQuestion: any = {
        question: "",
        type: "MULTIPLE_CHOICE",
        points: 1,
        explanation: "",
        options: [
            { option: "", isCorrect: true },
            { option: "", isCorrect: false }
        ]
    };

    // Fetch standalone tests
    const fetchStandaloneTests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tests', {
                params: {
                    standalone: true,
                    type: filterType === 'ALL' ? undefined : filterType,
                    limit: 100
                }
            });
            setStandaloneTests(response.data.data.tests || []);
        } catch (error) {
            console.error('Error fetching standalone tests:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch tests',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStandaloneTests();
    }, [filterType]);

    useEffect(() => {
        if (selectedTestId) {
            dispatch(fetchQuestionsByTestId(selectedTestId));
        }
    }, [dispatch, selectedTestId]);

    const startCreatingTest = (testType: 'PSYCHOMETRIC' | 'INTERVIEW') => {
        setCurrentTest({
            ...defaultTest,
            testType,
            id: Date.now().toString()
        });
        setIsEditingTest(false);
        setActiveTab('test-editor');
    };

    const saveTest = async () => {
        try {
            setCreatingTestLoading(true);
            if (isEditingTest && currentTest.id) {
                await dispatch(updateTest({ testData: currentTest, id: currentTest.id })).unwrap();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Updated',
                    detail: 'Test updated successfully!',
                    life: 3000
                });
            } else {
                await dispatch(createTest({ testData: currentTest, courseId: null })).unwrap();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Created',
                    detail: 'Test created successfully!',
                    life: 3000
                });
            }
            await fetchStandaloneTests();
            setActiveTab('tests');
            setCurrentTest(null);
        } catch (error: any) {
            console.error('Error saving test:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error || 'Failed to save test',
                life: 3000
            });
        } finally {
            setCreatingTestLoading(false);
        }
    };

    const handleDeleteTest = async () => {
        if (!testToDelete) return;
        try {
            await dispatch(deleteTest(testToDelete.id)).unwrap();
            await fetchStandaloneTests();
            toast.current?.show({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Test deleted successfully!',
                life: 3000
            });
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete test',
                life: 3000
            });
        } finally {
            setShowDeleteModal(false);
            setTestToDelete(null);
        }
    };

    const startCreatingQuestion = () => {
        setCurrentQuestion({ ...defaultQuestion, id: Date.now().toString() });
        setIsCreatingQuestion(true);
    };

    const addOption = () => {
        setCurrentQuestion((prev: any) => ({
            ...prev,
            options: [...prev.options, { option: '', isCorrect: false }]
        }));
    };

    const updateOption = (index: number, field: string, value: any) => {
        setCurrentQuestion((prev: any) => ({
            ...prev,
            options: prev.options.map((opt: any, i: number) =>
                i === index ? { ...opt, [field]: value } :
                    field === 'isCorrect' && value ? { ...opt, isCorrect: false } : opt
            )
        }));
    };

    const removeOption = (index: number) => {
        if (currentQuestion?.options.length > 2) {
            setCurrentQuestion((prev: any) => ({
                ...prev,
                options: prev.options.filter((_: any, i: number) => i !== index)
            }));
        }
    };

    const saveQuestion = async () => {
        setCreatingQuestionLoading(true);
        try {
            if (!currentQuestion?.question.trim()) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Validation Error',
                    detail: 'Please fill out the question',
                    life: 3000
                });
                return;
            }

            const formData = new FormData();
            formData.append('question', currentQuestion.question);
            formData.append('type', currentQuestion.type);
            formData.append('points', currentQuestion.points);
            formData.append('explanation', currentQuestion.explanation || '');

            if (currentQuestion.timePerQuestion) {
                formData.append('timePerQuestion', currentQuestion.timePerQuestion.toString());
            }

            if (currentQuestion.solution) {
                formData.append('solution', currentQuestion.solution);
            }

            if (currentQuestion.image) {
                formData.append('fileImage', currentQuestion.image);
            }

            if (currentQuestion.solutionImage) {
                formData.append('solutionImage', currentQuestion.solutionImage);
            }

            currentQuestion.options.forEach((opt: any, index: number) => {
                formData.append(`options[${index}][isCorrect]`, String(opt.isCorrect === true));
                formData.append(`options[${index}][option]`, opt.option);
            });

            await dispatch(addQuestion({ questionData: formData, testId: selectedTestId! })).unwrap();
            await dispatch(fetchQuestionsByTestId(selectedTestId!));

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Question added successfully!',
                life: 3000
            });

            setCurrentQuestion(null);
            setIsCreatingQuestion(false);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save question',
                life: 3000
            });
        } finally {
            setCreatingQuestionLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        try {
            await dispatch(deleteQuestion(questionId)).unwrap();
            await dispatch(fetchQuestionsByTestId(selectedTestId!));
            toast.current?.show({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Question deleted successfully!',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete question',
                life: 3000
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'solution') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (type === 'image') {
                setCurrentQuestion({ ...currentQuestion, image: file });
                if (file.type.startsWith('image/')) {
                    setPreviewUrl(URL.createObjectURL(file));
                }
            } else {
                setCurrentQuestion({ ...currentQuestion, solutionImage: file });
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <Toast ref={toast} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Standalone Test Manager</h1>
                <p className="text-gray-600 mt-2">Manage PSYCHOMETRIC and INTERVIEW tests independently</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
                {[
                    { key: 'tests', label: 'All Tests', icon: Award },
                    { key: 'test-questions', label: 'Questions', icon: FileQuestion },
                    { key: 'test-editor', label: 'Test Editor', icon: Edit }
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        disabled={key !== 'tests' && !selectedTestId && key !== 'test-editor'}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === key
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            } ${key !== 'tests' && !selectedTestId && key !== 'test-editor' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tests Tab */}
            {activeTab === 'tests' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <Filter size={20} className="text-gray-600" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Types</option>
                                <option value="PSYCHOMETRIC">Psychometric Only</option>
                                <option value="INTERVIEW">Interview Only</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => startCreatingTest('PSYCHOMETRIC')}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                <Plus size={16} />
                                New Psychometric Test
                            </button>
                            <button
                                onClick={() => startCreatingTest('INTERVIEW')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <Plus size={16} />
                                New Interview Test
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center p-8">
                            <StatusMessage type="loading" message="Loading tests..." />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {standaloneTests.map((test) => (
                            <div key={test.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg text-gray-900">{test.title}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${test.testType === 'PSYCHOMETRIC'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {test.testType}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <FileQuestion size={14} />
                                        {test._count?.questions || 0} questions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {test.duration} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Award size={14} />
                                        {test.passingScore}%
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setCurrentTest(test);
                                            setIsEditingTest(true);
                                            setSelectedTestId(test.id);
                                            setActiveTab('test-editor');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedTestId(test.id);
                                            setActiveTab('test-questions');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                    >
                                        <Eye size={14} />
                                        Questions
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTestToDelete(test);
                                            setShowDeleteModal(true);
                                        }}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!loading && standaloneTests.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <Award size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No standalone tests yet</p>
                            <p className="text-gray-500 text-sm mt-2">Create your first psychometric or interview test</p>
                        </div>
                    )}
                </div>
            )}

            {/* Test Editor Tab */}
            {activeTab === 'test-editor' && currentTest && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {isEditingTest ? 'Edit Test' : 'Create New Test'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Test Type *</label>
                            <select
                                value={currentTest.testType}
                                onChange={(e) => setCurrentTest({ ...currentTest, testType: e.target.value })}
                                disabled={isEditingTest}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PSYCHOMETRIC">Psychometric Test</option>
                                <option value="INTERVIEW">Interview Test</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {currentTest.testType === 'PSYCHOMETRIC'
                                    ? 'Personality and aptitude assessments with timed questions'
                                    : 'Technical interview questions with solutions'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                value={currentTest.title}
                                onChange={(e) => setCurrentTest({ ...currentTest, title: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Cognitive Ability Assessment"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={currentTest.description}
                                onChange={(e) => setCurrentTest({ ...currentTest, description: e.target.value })}
                                className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the purpose and content of this test"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={currentTest.duration}
                                    onChange={(e) => setCurrentTest({ ...currentTest, duration: parseInt(e.target.value) })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={currentTest.passingScore}
                                    onChange={(e) => setCurrentTest({ ...currentTest, passingScore: parseInt(e.target.value) })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Attempts</label>
                                <input
                                    type="number"
                                    value={currentTest.maxAttempts}
                                    onChange={(e) => setCurrentTest({ ...currentTest, maxAttempts: parseInt(e.target.value) })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={currentTest.randomizeQuestions}
                                    onChange={(e) => setCurrentTest({ ...currentTest, randomizeQuestions: e.target.checked })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm">Randomize Questions</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={currentTest.showResults}
                                    onChange={(e) => setCurrentTest({ ...currentTest, showResults: e.target.checked })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm">Show Results After Completion</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={saveTest}
                                disabled={creatingTestLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {creatingTestLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isEditingTest ? 'Update Test' : 'Create Test'}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('tests');
                                    setCurrentTest(null);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'test-questions' && selectedTestId && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Test Questions</h2>
                        <button
                            onClick={startCreatingQuestion}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus size={16} />
                            Add Question
                        </button>
                    </div>

                    {questionsLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    )}

                    {!questionsLoading && questions.length === 0 && (
                        <div className="text-center py-12">
                            <FileQuestion size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No questions yet</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {questions.map((question: any, index: number) => (
                            <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-2">
                                            <span className="text-blue-600 mr-2">{index + 1}.</span>
                                            {question.question}
                                        </p>
                                        {question.image && (
                                            <img src={question.image} alt="Question" className="max-w-xs rounded mb-2" />
                                        )}
                                        <div className="space-y-1">
                                            {question.options?.map((opt: any, idx: number) => (
                                                <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                    <span className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                                                        {String.fromCharCode(65 + idx)}. {opt.option}
                                                    </span>
                                                    {opt.isCorrect && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Question Creator Modal */}
                    {isCreatingQuestion && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">Add Question</h3>
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

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Question *</label>
                                        <textarea
                                            value={currentQuestion?.question}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                            className="w-full p-3 border rounded-lg h-24"
                                            placeholder="Enter your question"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Points</label>
                                            <input
                                                type="number"
                                                value={currentQuestion?.points}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                                                className="w-full p-3 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Type</label>
                                            <select
                                                value={currentQuestion?.type}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                                className="w-full p-3 border rounded-lg"
                                            >
                                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                                <option value="TRUE_FALSE">True/False</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium">Options</label>
                                            <button
                                                onClick={addOption}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded"
                                            >
                                                <Plus size={14} />
                                                Add Option
                                            </button>
                                        </div>
                                        {currentQuestion?.options.map((option: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="radio"
                                                    name="correct-option"
                                                    checked={option.isCorrect}
                                                    onChange={() => updateOption(index, 'isCorrect', true)}
                                                    className="w-4 h-4"
                                                />
                                                <input
                                                    type="text"
                                                    value={option.option}
                                                    onChange={(e) => updateOption(index, 'option', e.target.value)}
                                                    className="flex-1 p-2 border rounded"
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                />
                                                {currentQuestion.options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={saveQuestion}
                                            disabled={creatingQuestionLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {creatingQuestionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            Save Question
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsCreatingQuestion(false);
                                                setCurrentQuestion(null);
                                            }}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTest}
                title="Delete Test"
                message={`Are you sure you want to delete "${testToDelete?.title}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default StandaloneTestManager;
